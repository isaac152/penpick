import { IStreamingClient } from '../services/interfaces';
import { SpotifyApiError } from '../services/spotify/exceptions';
import { Playlist, PlaylistMetaData } from '../types/spotify-types';
import { logger } from '../logger';

const getRecommendedTracks = async (client: IStreamingClient, bands: string[]): Promise<string[]> => {
    try {
        const artistsId = await Promise.all(bands.map(band => client.getArtistID(band)));
        const topTracks = await Promise.all(artistsId.map(async artistId => await client.getTopTracks(artistId)));
        return topTracks.reduce((acc, tracks) => acc.concat(tracks), []);
    } catch (error) {
        logger.error({ bands, error }, 'Failed to get recommended tracks from Spotify');
        throw new SpotifyApiError();
    }
};

const generatePlaylistMetaData = (playlistKey: string): PlaylistMetaData => {
    return {
        name: `Playlist if you like: ${playlistKey}`,
        description: 'Hope you like it. If it was usefull please share with your friends',
        public: true
    };
};

const getPlaylistUrl = async (client: IStreamingClient, tracks: string[], playlistKey: string): Promise<string> => {
    try {
        const playlistMeta: PlaylistMetaData = generatePlaylistMetaData(playlistKey);
        const playlist: Playlist = await client.createPlaylist(playlistMeta);

        for (let i = 0; i < tracks.length; i += 100) {
            const trackBatch = tracks.slice(i, i + 100);
            await client.addTracksToPlaylist(playlist.id, trackBatch);
        }

        logger.info(
            { tracksCount: tracks.length, spotifyUrl: playlist.link },
            'Spotify playlist created successfully'
        );

        return playlist.link;
    } catch (error) {
        logger.error({ playlistKey, tracksCount: tracks.length, error }, 'Failed to create Spotify playlist');
        throw new SpotifyApiError();
    }
};

export { getPlaylistUrl, getRecommendedTracks };
