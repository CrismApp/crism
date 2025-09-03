const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/crism";

async function fixUserGold() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('crism');
    const usersCollection = db.collection('users');
    const rewardsCollection = db.collection('rewards');
    
    // Get the user
    const userId = "a30df5dc-63a8-442f-815a-69404a8f7457";
    const user = await usersCollection.findOne({ id: userId });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Current user gold:', user.goldAccumulated);
    
    // Calculate total gold from rewards
    const rewards = await rewardsCollection.find({ user: userId }).toArray();
    const totalGoldFromRewards = rewards.reduce((total, reward) => total + (reward.goldAwarded || 0), 0);
    
    console.log('Total gold from rewards:', totalGoldFromRewards);
    console.log('Rewards found:', rewards.length);
    
    // Update the user's gold
    const result = await usersCollection.updateOne(
      { id: userId },
      { $set: { goldAccumulated: totalGoldFromRewards } }
    );
    
    console.log('Update result:', result);
    
    // Verify the update
    const updatedUser = await usersCollection.findOne({ id: userId });
    console.log('Updated user gold:', updatedUser.goldAccumulated);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixUserGold();
