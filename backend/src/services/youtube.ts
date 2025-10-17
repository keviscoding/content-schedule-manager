import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
  title: string;
  thumbnail: string;
  publishedAt: Date;
  viewCount: string;
  videoId: string;
  url: string;
}

interface YouTubeChannelData {
  profilePicture: string;
  latestVideoTitle: string;
  latestVideoThumbnail: string;
  latestVideoDate: Date;
  subscriberCount: string;
  recentVideos: YouTubeVideo[];
}

export async function fetchYouTubeChannelData(channelUrl: string): Promise<YouTubeChannelData | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return null;
  }

  try {
    // Extract channel ID from URL
    const channelId = await extractChannelId(channelUrl);
    if (!channelId) return null;

    // Fetch channel info
    const channelResponse = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      return null;
    }

    const channel = channelResponse.data.items[0];
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    // Fetch latest 4 videos
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: 4,
        key: YOUTUBE_API_KEY,
      },
    });

    const latestVideo = videosResponse.data.items?.[0];
    const videoItems = videosResponse.data.items || [];

    // Get video IDs to fetch statistics
    const videoIds = videoItems.map((item: any) => item.contentDetails.videoId).join(',');
    
    // Fetch video statistics (views, etc.)
    const statsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'statistics',
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    const statsMap = new Map();
    statsResponse.data.items?.forEach((item: any) => {
      statsMap.set(item.id, item.statistics);
    });

    // Build recent videos array
    const recentVideos: YouTubeVideo[] = videoItems.map((item: any) => {
      const videoId = item.contentDetails.videoId;
      const stats = statsMap.get(videoId);
      return {
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
        publishedAt: new Date(item.snippet.publishedAt),
        viewCount: stats ? formatViewCount(stats.viewCount) : '0',
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    });

    return {
      profilePicture: channel.snippet.thumbnails.high.url,
      latestVideoTitle: latestVideo?.snippet.title || 'No videos',
      latestVideoThumbnail: latestVideo?.snippet.thumbnails.high?.url || '',
      latestVideoDate: latestVideo ? new Date(latestVideo.snippet.publishedAt) : new Date(),
      subscriberCount: formatSubscriberCount(channel.statistics.subscriberCount),
      recentVideos,
    };
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return null;
  }
}

async function extractChannelId(url: string): Promise<string | null> {
  // Direct channel ID
  const channelIdMatch = url.match(/youtube\.com\/channel\/([^\/\?]+)/);
  if (channelIdMatch) return channelIdMatch[1];

  // Handle @username format
  const handleMatch = url.match(/youtube\.com\/@([^\/\?]+)/);
  if (handleMatch) {
    try {
      const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          q: handleMatch[1],
          type: 'channel',
          maxResults: 1,
          key: YOUTUBE_API_KEY,
        },
      });
      return response.data.items?.[0]?.snippet?.channelId || null;
    } catch (error) {
      console.error('Error resolving channel handle:', error);
      return null;
    }
  }

  // Handle /c/ format
  const customMatch = url.match(/youtube\.com\/c\/([^\/\?]+)/);
  if (customMatch) {
    try {
      const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          q: customMatch[1],
          type: 'channel',
          maxResults: 1,
          key: YOUTUBE_API_KEY,
        },
      });
      return response.data.items?.[0]?.snippet?.channelId || null;
    } catch (error) {
      console.error('Error resolving custom channel URL:', error);
      return null;
    }
  }

  return null;
}

function formatSubscriberCount(count: string): string {
  const num = parseInt(count);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return count;
}

function formatViewCount(count: string): string {
  const num = parseInt(count);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return count;
}
