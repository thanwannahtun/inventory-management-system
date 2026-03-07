import { Product } from '@/db/models/Product';
import { StockBatch } from '@/db/models/StockBatch';
import { StockOut } from '@/db/models/StockOut';
import { ActivityLog } from '@/db/models/ActivityLog';
import { Category } from '@/db/models/Category';
import { Op } from 'sequelize';
import { connectDatabase } from '@/db/config/database';
import { Specification } from '@/db/models/Specification';

export interface FIFOStockAllocation {
  batchId: number;
  quantity: number;
  costPrice: number;
  remainingQuantity: number;
}

export interface FIFOStockOutResult {
  allocations: FIFOStockAllocation[];
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  success: boolean;
  error?: string;
}

export class FIFOService {
  /**
   * Add stock to a product using FIFO (creates new batch)
   */
  static async addStock(
    productId: number,
    quantity: number,
    purchasePrice: number,
    operator: string,
    transaction?: any
  ): Promise<StockBatch> {
    // Create new stock batch
    const batch = await StockBatch.create({
      productId,
      initialQuantity: quantity,
      remainingQuantity: quantity,
      purchasePrice,
      receivedDate: new Date()
    }, transaction ? { transaction } : {});

    // Log the activity
    await ActivityLog.create({
      type: 'stock_in',
      description: `Added ${quantity} units of product ${productId} at ${purchasePrice} per unit`,
      operator,
      createdAt: new Date()
    }, transaction ? { transaction } : {});

    return batch;
  }

  /**
   * Remove stock using FIFO logic
   */
  static async removeStock(
    productId: number,
    quantity: number,
    unitPrice: number, // Selling price
    reason: string,
    operator: string,
    notes?: string,
    transaction?: any
  ): Promise<FIFOStockOutResult> {
    try {
      // Get product with stock batches ordered by received date (FIFO)
      const product = await Product.findByPk(productId, {
        include: [
          {
            model: StockBatch,
            as: 'stockBatches',
            where: {
              remainingQuantity: { [Op.gt]: 0 }
            },
            order: [['receivedDate', 'ASC'], ['createdAt', 'ASC']]
          }
        ],
        transaction: transaction || undefined
      });

      if (!product) {
        return { success: false, error: 'Product not found', allocations: [], totalCost: 0, totalValue: 0, totalProfit: 0 };
      }

      const batches = product.stockBatches || [];
      const totalAvailable = batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);

      if (totalAvailable < quantity) {
        return { success: false, error: 'Insufficient stock', allocations: [], totalCost: 0, totalValue: 0, totalProfit: 0 };
      }

      const allocations: FIFOStockAllocation[] = [];
      let remainingQuantity = quantity;
      let totalCost = 0;

      // Allocate stock using FIFO
      for (const batch of batches) {
        if (remainingQuantity <= 0) break;

        const allocatedQuantity = Math.min(remainingQuantity, batch.remainingQuantity);

        allocations.push({
          batchId: batch.id,
          quantity: allocatedQuantity,
          costPrice: batch.purchasePrice,
          remainingQuantity: batch.remainingQuantity - allocatedQuantity
        });

        totalCost += allocatedQuantity * batch.purchasePrice;
        remainingQuantity -= allocatedQuantity;

        // Update batch remaining quantity
        await batch.update({
          remainingQuantity: batch.remainingQuantity - allocatedQuantity
        }, transaction ? { transaction } : {});
      }

      const totalValue = quantity * unitPrice;
      const totalProfit = totalValue - totalCost;

      // Create stock out records for each allocation
      for (const allocation of allocations) {
        await StockOut.create({
          productId: product.id,
          productName: product.name,
          quantity: allocation.quantity,
          reason,
          date: new Date().toISOString().split('T')[0],
          operator,
          category: 'Product', // Would come from product relationship
          unitPrice,
          costPrice: allocation.costPrice,
          totalValue: allocation.quantity * unitPrice,
          totalCost: allocation.quantity * allocation.costPrice,
          profit: allocation.quantity * (unitPrice - allocation.costPrice),
          notes: notes || null,
          batchId: allocation.batchId
        }, transaction ? { transaction } : {});
      }

      // Log the activity
      await ActivityLog.create({
        type: 'stock_out',
        description: `${quantity} units of ${product.name} - ${reason}`,
        operator,
        createdAt: new Date()
      }, transaction ? { transaction } : {});

      return {
        success: true,
        allocations,
        totalCost,
        totalValue,
        totalProfit
      };

    } catch (error) {
      console.error('FIFO stock removal error:', error);
      return { success: false, error: 'Internal server error', allocations: [], totalCost: 0, totalValue: 0, totalProfit: 0 };
    }
  }

  /**
   * Get current stock status with batch information
   */
  static async getStockStatus(productId: number, transaction?: any) {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: StockBatch,
          as: 'stockBatches',
          order: [['receivedDate', 'ASC'], ['createdAt', 'ASC']]
        },
        {
          model: Category,
          as: 'categoryRelation',
          attributes: ['id', 'name']
        },
        {
          model: Specification,
        },

      ],
      transaction: transaction || undefined
    });

    if (!product) {
      return null;
    }

    const batches = product.stockBatches || [];
    const totalQuantity = batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
    const totalValue = batches.reduce((sum, batch) => sum + (batch.remainingQuantity * batch.purchasePrice), 0);
    const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

    return {
      // product: {
      // ...product,
      // price: product.price, // Selling price
      // quantity: totalQuantity,
      // inventoryValue: totalValue,
      // averageCost
      // },
      product: { ...product.get({ plain: true }), price: product.price, quantity: totalQuantity, inventoryValue: totalValue, averageCost },
      batches: batches.map(batch => ({
        id: batch.id,
        initialQuantity: batch.initialQuantity,
        remainingQuantity: batch.remainingQuantity,
        purchasePrice: batch.purchasePrice,
        receivedDate: batch.receivedDate,
        value: batch.remainingQuantity * batch.purchasePrice
      })),
      category: product.categoryRelation,
      specification: product.specification,
    };
  }

  /**
   * Get all products with their stock status
   */
  static async getAllStockStatus(transaction?: any) {

    const products = await Product.findAll({
      include: [
        {
          model: StockBatch,
          as: 'stockBatches',
          order: [['receivedDate', 'ASC'], ['createdAt', 'ASC']]
        },
        {
          model: Category,
          as: 'categoryRelation',
          attributes: ['id', 'name']
        }
      ],
      transaction: transaction || undefined
    });

    return products.map(product => {
      const batches = product.stockBatches || [];
      const totalQuantity = batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
      const totalValue = batches.reduce((sum, batch) => sum + (batch.remainingQuantity * batch.purchasePrice), 0);
      const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

      return {
        id: product.id,
        name: product.name,
        price: product.price, // Selling price
        quantity: totalQuantity,
        inventoryValue: totalValue,
        averageCost,
        category: product.categoryRelation,
        batches: batches.map(batch => ({
          id: batch.id,
          initialQuantity: batch.initialQuantity,
          remainingQuantity: batch.remainingQuantity,
          purchasePrice: batch.purchasePrice,
          receivedDate: batch.receivedDate,
          value: batch.remainingQuantity * batch.purchasePrice
        }))
      };
    });
  }
}
