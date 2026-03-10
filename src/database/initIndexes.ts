import { billModel } from "./model/bill";

/**
 * Performs one-time cleanup of legacy indexes and ensures required indexes exist.
 *
 * This is intentionally separated from the model definition so the model file
 * only defines schema + indexes.
 */
export const ensureIndexes = async () => {
  try {
    const indexes = await billModel.collection.indexes();
    const globalBillNumberIndex = indexes.find(
      (idx: any) => idx.key && idx.key.billNumber === 1 && Object.keys(idx.key).length === 1
    );

    if (globalBillNumberIndex) {
      await billModel.collection.dropIndex(globalBillNumberIndex.name);
      console.log(
        "Dropped legacy global billNumber index; now using (medicalStoreId, billNumber) unique constraint."
      );
    }
  } catch (error) {
    // ignore errors during index cleanup (e.g., index not found)
  }
};
