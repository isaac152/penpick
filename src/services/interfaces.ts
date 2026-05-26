import { Playlist, PlaylistMetaData } from '../types/spotify-types';

export interface IStreamingClient {
    validateConnection: () => Promise<void>;
    getArtistID: (artist: string) => Promise<string>;
    getTopTracks: (artistId: string) => Promise<string[]>;
    createPlaylist: (playlistMeta: PlaylistMetaData) => Promise<Playlist>;
    addTracksToPlaylist: (playlistId: string, tracks: string[]) => Promise<void>;
}
