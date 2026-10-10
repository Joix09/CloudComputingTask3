package com.josh.rental.receipt;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.BlobStorageException;
import com.azure.core.util.BinaryData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Stores receipt PDFs as blobs in a private Azure Blob Storage container.
 * Files are only reachable through the API, never through a public blob URL.
 */
@Component
public class ReceiptStorage {

    private final BlobContainerClient container;
    private volatile boolean containerReady;

    public ReceiptStorage(@Value("${app.storage.connection-string}") String connectionString,
                          @Value("${app.storage.receipts-container}") String containerName) {
        this.container = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient()
                .getBlobContainerClient(containerName);
    }

    public void upload(String name, byte[] pdf) {
        BlobClient blob = blob(name);
        blob.upload(BinaryData.fromBytes(pdf), true);
        blob.setHttpHeaders(new BlobHttpHeaders().setContentType("application/pdf"));
    }

    public Optional<byte[]> download(String name) {
        try {
            return Optional.of(blob(name).downloadContent().toBytes());
        } catch (BlobStorageException e) {
            if (e.getStatusCode() == 404) {
                return Optional.empty();
            }
            throw e;
        }
    }

    public void delete(String name) {
        blob(name).deleteIfExists();
    }

    // Created on first use rather than at startup, so the API still starts if storage is briefly unreachable
    private BlobClient blob(String name) {
        if (!containerReady) {
            container.createIfNotExists();
            containerReady = true;
        }
        return container.getBlobClient(name);
    }
}
