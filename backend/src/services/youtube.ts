import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeChannelData {
  profilePicture: string;
  latestVideoTitle: string;
  latestVideoThumbnail: string;
  latestVideoDate: Date;
  subscriberCount: string;
}

export async function fetchYouTubeChannelData(channelUrl: string): Promise<YouTubeChannelData | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return null;
  }

  try {
    // Extract channel ID from URL
    const channelId = extractChannelId(channelUrl);
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

    // Fetch latest video
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        part: 'snippet',
        playlistId: uploadsPlaylistId,
        maxResults: 1,
        key: YOUTUBE_API_KEY,
      },
    });

    const latestVideo = videosResponse.data.items?.[0];

    return {
      profilePicture: channel.snippet.thumbnails.high.url,
      latestVideoTitle: latestVideo?.snippet.title || 'No videos',
      latestVideoThumbnail: latestVideo?.snippet.thumbnails.high.url || '',
      latestVideoDate: latestVideo ? new Date(latestVideo.snippet.publishedAt) : new Date(),
      subscriberCount: formatSubscriberCount(channel.statistics.subscriberCount),
    };
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return null;
  }
}

function extractChannelId(url: string): string | null {
  const patterns = [
    /youtube\.com\/channel\/([^\/\?]+)/,
    /youtube\.com\/@([^\/\?]+)/,
    /youtube\.com\/c\/([^\/\?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function formatSubscriberCount(count: string): string {
  const num = parseInt(count);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return count;
}
