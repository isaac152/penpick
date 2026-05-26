import puppeteer from 'puppeteer';
import { Browser, ElementHandle, Page } from 'puppeteer';
import { SEARCH_URL, PAGE_DIMENSION, WAIT_TIME, BROWSER_ARGS } from './constants';
import { Band } from '../../types/band-types';
import { EmptyBandDataError } from './exceptions';
import { logger } from '../../logger';

const parseBandData = async (band_map: ElementHandle): Promise<Band[]> => {
    return band_map.$$eval('a', anchors =>
        anchors.map(anchor => {
            const { top, left, width, height } = anchor.getBoundingClientRect();
            const band: Band = {
                name: anchor.textContent || '',
                id: anchor.id,
                coordenates: [left + width / 2, top + height / 2]
            };
            return band;
        })
    );
};

const getBands = async (band_name: string): Promise<Band[]> => {
    const browser: Browser = await puppeteer.launch({
        args: BROWSER_ARGS,
        defaultViewport: null
    });

    try {
        const page: Page = await browser.newPage();
        const band_url = `${SEARCH_URL}?f=${encodeURIComponent(band_name)}`;

        await page.setViewport(PAGE_DIMENSION);
        await page.goto(band_url, {
            waitUntil: 'load'
        });
        await new Promise(r => setTimeout(r, WAIT_TIME));

        const band_map = await page.$('#gnodMap');
        if (!band_map) throw new EmptyBandDataError(page.url());

        const bands = await parseBandData(band_map);
        logger.info({ artist: band_name }, 'Successfully got artist');
        return bands;
    } catch (error) {
        logger.error({ artist: band_name, error }, 'Error while getting artist');
        throw error;
    } finally {
        await browser.close();
    }
};

export { getBands };
