export type SearchOptions = {
    limit?: string;
    offset?: string;
    include_external?: string;
    market?: string;
};

export type PlaylistMetaData = {
    name: string;
    description: string;
    public: boolean;
};

export type Playlist = {
    id: string;
    link: string;
};

export type PlaylistDetails = {
    baseBand: string;
    shuffle: boolean;
};
