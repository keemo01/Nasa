export default function handler(request, response) {
    response.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
    });
}
