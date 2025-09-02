// lib/rewards.ts
import { User, Reward, PortfolioActivity } from "./model";

export function calculateRank(gold: number): string {
  if (gold >= 10000) return "Diamond";
  if (gold >= 5000) return "Platinum";
  if (gold >= 2000) return "Gold";
  if (gold >= 500) return "Silver";
  return "Bronze";
}

// Helper function to award gold and update rank
export async function awardGold(userId: string, amount: number, reason: string = "") {
  try {
    const user = await User.findOne({ id: userId });
    if (!user) throw new Error("User not found");

    const newGoldTotal = (user.goldAccumulated || 0) + amount;
    const newRank = calculateRank(newGoldTotal);

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      { 
        goldAccumulated: newGoldTotal,
        rank: newRank,
        updatedAt: new Date()
      },
      { new: true }
    );

    // Create reward record
    await Reward.create({
      user: userId,
      type: 'special',
      title: 'Gold Earned',
      description: reason,
      goldAwarded: amount,
      points: amount * 10, // 1 gold = 10 points
      earnedAt: new Date()
    });

    console.log(`✨ Awarded ${amount} gold to user ${userId}. New total: ${newGoldTotal}`);
    return updatedUser;

  } catch (error) {
    console.error("Failed to award gold:", error);
    throw error;
  }
}

// Helper function to award gold for portfolio activities
export async function awardPortfolioGold(userId: string, activityType: string, amount?: number) {
  const goldRewards = {
    'wallet_connect': 50,
    'first_transaction': 100,
    'defi_position': 200,
    'yield_farm': 150,
    'bridge_transaction': 100,
    'large_transaction': 300, // For transactions > $1000
  };

  const goldAmount = goldRewards[activityType as keyof typeof goldRewards] || 10;
  const descriptions = {
    'wallet_connect': 'Connected your first wallet!',
    'first_transaction': 'Made your first transaction!',
    'defi_position': 'Opened a DeFi position!',
    'yield_farm': 'Started yield farming!',
    'bridge_transaction': 'Completed a cross-chain bridge!',
    'large_transaction': 'Made a large transaction!',
  };

  const description = descriptions[activityType as keyof typeof descriptions] || 'Portfolio activity';

  try {
    await awardGold(userId, goldAmount, description);
    
    // Log portfolio activity
    const user = await User.findOne({ id: userId });
    
    await PortfolioActivity.create({
      user: userId,
      walletAddress: user?.walletAddress || '',
      activityType,
      amount: amount || 0,
      goldEarned: goldAmount,
      timestamp: new Date()
    });

  } catch (error) {
    console.error("Failed to award portfolio gold:", error);
  }
}
