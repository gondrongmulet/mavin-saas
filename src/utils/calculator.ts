import { Recipe, Ingredient } from '../types';

/**
 * Calculates total raw material cost for 1 batch of a recipe
 */
export function calculateBatchRawMaterialCost(recipe: Recipe, ingredients: Ingredient[]): number {
  const ingMap = new Map(ingredients.map(i => [i.id, i]));
  return recipe.ingredients.reduce((total, ri) => {
    const ing = ingMap.get(ri.ingredientId);
    if (!ing) return total;
    return total + (ri.quantity * ing.costPerUnit);
  }, 0);
}

/**
 * Calculates total overhead cost for 1 batch of a recipe
 */
export function calculateBatchOverheadCost(recipe: Recipe): number {
  return recipe.overheads.reduce((sum, ov) => sum + ov.cost, 0);
}

/**
 * Calculates total HPP for 1 batch and HPP per unit
 */
export function calculateRecipeHppDetails(recipe: Recipe, ingredients: Ingredient[]) {
  const rawMaterialCost = calculateBatchRawMaterialCost(recipe, ingredients);
  const overheadCost = calculateBatchOverheadCost(recipe);
  const totalBatchHpp = rawMaterialCost + overheadCost;
  const yieldQty = Math.max(1, recipe.batchYield);
  const hppPerUnit = Math.round(totalBatchHpp / yieldQty);

  return {
    rawMaterialCost,
    overheadCost,
    totalBatchHpp,
    hppPerUnit,
    yieldQty
  };
}

/**
 * Calculates recommended selling price given HPP per unit and target margin %
 * Formula: Selling Price = HPP / (1 - Margin%)
 */
export function calculateRecommendedPrice(hppPerUnit: number, targetMarginPercent: number): number {
  if (targetMarginPercent >= 100) return hppPerUnit * 2;
  const marginDecimal = Math.min(0.99, Math.max(0, targetMarginPercent / 100));
  const exactPrice = hppPerUnit / (1 - marginDecimal);
  // Round to nearest 500 IDR for clean UMKM pricing
  return Math.ceil(exactPrice / 500) * 500;
}

/**
 * Calculates profit margin % and profit in IDR given selling price and HPP per unit
 * Formula: Margin % = ((Selling Price - HPP) / Selling Price) * 100
 */
export function calculateMarginFromPrice(hppPerUnit: number, sellingPrice: number) {
  if (sellingPrice <= 0) return { marginPercent: 0, profitPerUnit: 0 };
  const profitPerUnit = sellingPrice - hppPerUnit;
  const marginPercent = Math.round((profitPerUnit / sellingPrice) * 1000) / 10;
  return {
    marginPercent,
    profitPerUnit
  };
}

/**
 * Helper to format number as Indonesian Rupiah (Rp)
 */
export function formatIdr(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Math.round(amount || 0));
}

/**
 * Helper to format compact numbers for UI cards
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.round(amount || 0));
}
