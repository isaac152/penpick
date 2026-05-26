import { getBands } from '../services/scraping';
import { BandNotFoundError } from '../services/scraping/exceptions';
import { Band } from '../types/band-types';
import { logger } from '../logger';

function getBandsDistance(origin: Band, final: Band): Band {
    const deltaX = final.coordenates[0] - origin.coordenates[0];
    const deltaY = final.coordenates[1] - origin.coordenates[1];
    const delta = Math.hypot(deltaX, deltaY);
    return { ...final, distance: delta };
}

const getBandsRecomendations = async (inputBand: string): Promise<string[]> => {
    try {
        const bands = await getBands(inputBand);
        const distanceBands: Band[] = bands.map((band: Band) => getBandsDistance(bands[0], band));
        distanceBands.shift();
        distanceBands.sort((a: Band, b: Band) => (a.distance || 0) - (b.distance || 0));

        return distanceBands.map((band: Band) => band.name);
    } catch (error) {
        logger.error({ inputBand, error }, 'Failed to get band recommendations');
        throw new BandNotFoundError(inputBand);
    }
};

export { getBandsRecomendations };
