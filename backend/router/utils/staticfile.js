const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const zlib = require('zlib');

const staticfile = async (pathName, req, res, fallback, headers = {}, root = null) => {
    try {
        const decoded = decodeURIComponent(pathName);

        const reqUrl = req.url || '/';
        const qIdx = reqUrl.indexOf('?');
        const urlPath = qIdx !== -1 ? reqUrl.slice(0, qIdx) : reqUrl;
        const urlQuery = qIdx !== -1 ? reqUrl.slice(qIdx) : '';
        if (urlPath !== '/' && /\/+$/.test(urlPath)) {
            const cleanUrl = urlPath.replace(/\/+$/, '') + urlQuery;
            res.writeHead(301, { Location: cleanUrl });
            return res.end('');
        }

        const normalized = path.normalize(decoded.endsWith('\\') ? decoded.slice(0, -1) : decoded);

        if (root) {
            const resolvedRoot = path.resolve(root);
            const resolvedPath = path.resolve(normalized);
            if (!resolvedPath.startsWith(resolvedRoot + path.sep) && resolvedPath !== resolvedRoot) {
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                return res.end('Forbidden');
            }
        }

        const acceptEncoding = req.headers['accept-encoding'] || '';
        const result = await resolveFilePath(normalized, fallback);

        if (!result) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('');
        }

        sendFile(res, acceptEncoding, result.filePath, result.stats, headers);
    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('');
    }
};

const resolveFilePath = async (pathName, fallback) => {
    const candidates = [
        pathName,
        pathName + '.html',
        path.join(pathName, 'index.html'),
    ];

    for (const candidate of candidates) {
        try {
            const stats = await fs.promises.stat(candidate);
            if (stats.isFile()) return { filePath: candidate, stats };
        } catch {
            // not found, try next candidate
        }
    }

    if (fallback) {
        try {
            const stats = await fs.promises.stat(fallback);
            if (stats.isFile()) return { filePath: fallback, stats };
        } catch {
            // fallback not found
        }
    }

    return null;
};

const sendFile = (res, acceptEncoding, filePath, stats, headers = {}) => {
    const mimeType = mime.lookup(filePath) || 'text/plain';
    const etag = `"${stats.size}-${stats.mtimeMs}"`;
    const compressible =
        process.env.COMPRESSION === 'true' &&
        acceptEncoding &&
        stats.size > 140 &&
        /text\/plain|text\/html|text\/xml|text\/css|application\/xml|application\/xhtml\+xml|application\/rss\+xml|application\/javascript|application\/x-javascript/.test(mimeType);

    const baseHeaders = {
        ...headers,
        'Content-Type': mimeType,
        'ETag': etag,
        'Last-Modified': stats.mtime.toUTCString(),
        'Cache-Control': 'public, max-age=3600',
    };

    const raw = fs.createReadStream(filePath);
    raw.on('error', () => {
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
        }
        res.end('');
    });

    if (compressible && acceptEncoding.match(/\bgzip\b/)) {
        res.writeHead(200, { ...baseHeaders, 'Content-Encoding': 'gzip' });
        raw.pipe(zlib.createGzip()).pipe(res);
    } else if (compressible && acceptEncoding.match(/\bdeflate\b/)) {
        res.writeHead(200, { ...baseHeaders, 'Content-Encoding': 'deflate' });
        raw.pipe(zlib.createDeflate()).pipe(res);
    } else {
        res.writeHead(200, { ...baseHeaders, 'Content-Length': stats.size });
        raw.pipe(res);
    }
};

module.exports = staticfile;