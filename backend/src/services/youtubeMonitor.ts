import cron from 'node-cron';
import { Channel } from '../models/Channel';
import { fetchYouTubeChannelData } from './youtube';

// Check YouTube every 15 minutes
export function startYouTubeMonitoring() {
  console.log('Starting YouTube monitoring service...');
  
  // Run immediately on startup
  checkAllChannels();
  
  // Then run every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    console.log('Running YouTube check...');
    checkAllChannels();
  });
}

async function checkAllChannels() {
  try {
    const channels = await Channel.find({});
    
    for (const channel of channels) {
      try {
        const youtubeData = await fetchYouTubeChannelData(channel.youtubeUrl);
        
        if (youtubeData) {
          // Update channel with latest data
          channel.latestVideoDate = youtubeData.latestVideoDate;
          channel.latestVideoTitle = youtubeData.latestVideoTitle;
          channel.lastYouTubeCheck = new Date();
          
          // Calculate status based on time since last upload
          const hoursSinceUpload = (Date.now() - youtubeData.latestVideoDate.getTime()) / (1000 * 60 * 60);
          
          // 18-24 hour posting schedule
          if (hoursSinceUpload > 24) {
            channel.status = 'overdue';
          } else if (hoursSinceUpload > 18) {
            channel.status = 'due-soon';
          } else {
            channel.status = 'on-time';
          }
          
          await channel.save();
          console.log(`Updated channel: ${channel.name} - Last upload: ${hoursSinceUpload.toFixed(1)}h ago`);
        }
      } catch (error) {
        console.error(`Error checking channel ${channel.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in YouTube monitoring:', error);
  }
}

// Export for manual trigger
export { checkAllChannels };
