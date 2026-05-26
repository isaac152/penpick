import { Playlist, PlaylistMetaData } from '../types/spotify-types';
import { RecentPlaylist } from './storage/interfaces';

export interface IStreamingClient {
    validateConnection: () => Promise<void>;
    getRecentPlaylists: () => Promise<RecentPlaylist[]>;
    getArtistID: (artist: string) => Promise<string>;
    getTopTracks: (artistId: string) => Promise<string[]>;
    createPlaylist: (playlistMeta: PlaylistMetaData) => Promise<Playlist>;
    addTracksToPlaylist: (playlistId: string, tracks: string[]) => Promise<void>;
}
