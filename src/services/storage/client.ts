import NodeCache from 'node-cache';
import { RecentPlaylist, StorageImplementation } from './interfaces';

const RECENT_PLAYLISTS_KEY = 'recent-playlists';

export class CacheStorageClient implements StorageImplementation {
    private static instance: CacheStorageClient;
    private controller: NodeCache = new NodeCache({ stdTTL: 3600, checkperiod: 7200 });

    constructor() {
        if (CacheStorageClient.instance) {
            return CacheStorageClient.instance;
        }
        CacheStorageClient.instance = this;
    }

    getValue(key: string): string {
        return this.controller.get(key) || '';
    }

    setValue(key: string, value: string): void {
        this.controller.set(key, value);
    }

    private getCachedPlaylistEntries(): RecentPlaylist[] {
        return this.controller
            .keys()
            .filter(key => key !== RECENT_PLAYLISTS_KEY)
            .map(key => ({ name: key, url: this.getValue(key) }))
            .filter(playlist => playlist.url)
            .slice(-5)
            .reverse();
    }

    getRecentPlaylists(): RecentPlaylist[] {
        const recentPlaylists = this.controller.get<RecentPlaylist[]>(RECENT_PLAYLISTS_KEY);

        if (recentPlaylists && recentPlaylists.length > 0) {
            return recentPlaylists;
        }

        const cachedPlaylists = this.getCachedPlaylistEntries();

        if (cachedPlaylists.length > 0) {
            this.controller.set(RECENT_PLAYLISTS_KEY, cachedPlaylists, 0);
        }

        return cachedPlaylists;
    }

    setRecentPlaylists(playlists: RecentPlaylist[]): RecentPlaylist[] {
        this.controller.set(RECENT_PLAYLISTS_KEY, playlists.slice(0, 5), 0);
        return this.getRecentPlaylists();
    }

    addRecentPlaylist(playlist: RecentPlaylist): RecentPlaylist[] {
        const currentPlaylists = this.getRecentPlaylists();
        const updatedPlaylists = currentPlaylists.filter(currentPlaylist => currentPlaylist.url !== playlist.url);

        updatedPlaylists.unshift(playlist);
        return this.setRecentPlaylists(updatedPlaylists);
    }
}
