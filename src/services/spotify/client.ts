import {
    REFRESH_TOKEN,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    REFRESH_URL,
    SEARCH_URL,
    ARTIST_URL,
    CREATE_PLAYLIST_URL,
    PLAYLIST_URL,
    regionTopTracks
} from './constants';
import { Response } from 'node-fetch';
import fetch from 'node-fetch';
import { Playlist, PlaylistMetaData, SearchOptions } from '../../types/spotify-types';
import { IStreamingClient } from '../interfaces';
import { logger } from '../../logger';

type Headers = {
    'Content-Type': string;
    Authorization: string;
};

export class SpotifyClient implements IStreamingClient {
    private static instance: SpotifyClient;
    private accessToken = '';
    private tokenTime: Date = new Date();

    constructor() {
        if (SpotifyClient.instance) {
            return SpotifyClient.instance;
        }
        SpotifyClient.instance = this;
    }

    private async checkTokenTime(): Promise<void> {
        if (new Date() >= this.tokenTime) await this.refreshToken();
    }

    private generateHeaders(): Headers {
        return { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/x-www-form-urlencoded' };
    }

    private async getResponseData(response: Response, operation: string): Promise<any> {
        if (!response.ok) {
            const errorBody = await response.text();
            logger.error(
                { operation, status: response.status, statusText: response.statusText, errorBody },
                'Spotify API request failed'
            );
            throw new Error(`Spotify API error during ${operation}`);
        }

        return await response.json();
    }

    private async refreshToken(): Promise<void> {
        const body = new URLSearchParams();
        const headers = {
            Authorization:
                'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET, 'binary').toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        body.append('grant_type', 'refresh_token');
        body.append('refresh_token', REFRESH_TOKEN);

        const response: Response = await fetch(REFRESH_URL, {
            method: 'POST',
            body: body,
            headers: headers
        });
        const data: any = await this.getResponseData(response, 'refreshToken');
        const expireTime = new Date();
        expireTime.setSeconds(data.expires_in);
        this.accessToken = data.access_token;
        this.tokenTime = expireTime;
    }

    private async search(query: string, types: string[], options?: SearchOptions): Promise<any> {
        await this.checkTokenTime();
        const queryParameter = {
            q: query,
            type: types.join(','),
            ...options
        };
        const response: Response = await fetch(SEARCH_URL + new URLSearchParams(queryParameter), {
            headers: this.generateHeaders()
        });
        return await this.getResponseData(response, 'search');
    }

    private async searchArtists(query: string, options?: SearchOptions): Promise<any> {
        return await this.search(query, ['artist'], options);
    }

    async getArtistID(artist: string): Promise<string> {
        const artistData = await this.searchArtists(artist);
        const artistItems: any[] = artistData.artists.items;
        return artistItems.length !== 0 ? artistItems[0].id : '';
    }

    async getTopTracks(artistId: string): Promise<string[]> {
        await this.checkTokenTime();
        const response: Response = await fetch(ARTIST_URL + `/${artistId}/top-tracks?market=${regionTopTracks}`, {
            headers: this.generateHeaders()
        });
        const tracksData: any = await this.getResponseData(response, 'getTopTracks');
        return tracksData.tracks.map((track: any) => track.uri);
    }

    async createPlaylist(playlistMeta: PlaylistMetaData): Promise<Playlist> {
        await this.checkTokenTime();
        const response: Response = await fetch(CREATE_PLAYLIST_URL, {
            method: 'POST',
            body: JSON.stringify(playlistMeta),
            headers: this.generateHeaders()
        });
        const playlistData: any = await this.getResponseData(response, 'createPlaylist');
        return await { id: playlistData.id, link: playlistData.external_urls.spotify };
    }

    async addTracksToPlaylist(playlistId: string, tracks: string[]): Promise<void> {
        await this.checkTokenTime();
        const response: Response = await fetch(PLAYLIST_URL + `/${playlistId}/tracks`, {
            method: 'POST',
            body: JSON.stringify({ uris: tracks }),
            headers: this.generateHeaders()
        });
        await this.getResponseData(response, 'addTracksToPlaylist');
    }
}
