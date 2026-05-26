import { IStreamingClient } from "../../src/services/interfaces";
import { Playlist, PlaylistMetaData } from "../../src/types/spotify-types";

export class MockSpotifyClient implements IStreamingClient {

    async validateConnection(): Promise<void> {
        return;
    }


    async getArtistID(artist: string): Promise<string> {
        return '6olE6TJLqED3rqDCT0FyPh'
    }

    async getTopTracks(artistId: string): Promise<string[]> {
        return ["spotify:track:4CeeEOM32jQcH3eN9Q2dGj","spotify:track:2RsAajgo0g7bMCHxwH3Sk0","spotify:track:2RsAajgo0g7bMCHxwH3Sk0"]
    }

    async createPlaylist(playlistMeta: PlaylistMetaData): Promise<Playlist> {
        if (playlistMeta.name ==='Playlist if you like: error') throw new Error('Mock error')
        return { id: '3cEYpjA9oz9GiPac4AsH4n', link: "https://spotify.com/someplaylistlol"};
    }

    async addTracksToPlaylist(playlistId: string, tracks: string[]): Promise<void> {
        return 
    }
}
