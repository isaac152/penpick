type RecentPlaylist = {
    name: string;
    url: string;
};

export interface StorageImplementation {
    getValue: (key: string) => string;
    setValue: (key: string, value: string) => void;
    getRecentPlaylists: () => RecentPlaylist[];
    setRecentPlaylists: (playlists: RecentPlaylist[]) => RecentPlaylist[];
    addRecentPlaylist: (playlist: RecentPlaylist) => RecentPlaylist[];
}

export type { RecentPlaylist };
