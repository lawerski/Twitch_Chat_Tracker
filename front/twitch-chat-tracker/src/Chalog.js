import React, { useEffect, useState } from 'react';

const ChatLog = () => {
    const [logData, setLogData] = useState(null); // State do przechowywania danych logów
    const [error, setError] = useState(null); // State do przechowywania błędów

    // Funkcja do pobierania logu z naszego serwera (Express + MongoDB Atlas)
    const fetchLogData = async () => {
        try {
            const response = await fetch('http://localhost:3001/'); // API endpoint
            if (!response.ok) throw new Error('Błąd sieciowy przy pobieraniu danych');
            const data = await response.json(); // Zakładamy, że serwer zwraca dane w formacie JSON
            setLogData(data); // Zapisz pobrane dane logów
        } catch (err) {
            setError(err.message); // Zapisz ewentualny błąd
        }
    };

    // useEffect do wywoływania fetchLogData przy montowaniu komponentu oraz co 10 sekund
    useEffect(() => {
        fetchLogData(); // Pobierz dane przy pierwszym załadowaniu komponentu

        // Ustawienie interwału do odświeżania co 10 sekund
        const interval = setInterval(fetchLogData, 10000);

        // Sprzątanie interwału przy odmontowaniu komponentu
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h2>Latest Chat Log from MongoDB Atlas</h2>
            {error ? (
                <p style={{ color: 'red' }}>Error: {error}</p>
            ) : logData ? (
                <div>
                    <p><strong>Timestamp:</strong> {logData.time}</p>
                    <p><strong>Most Active User:</strong> {logData.msgCtn?.key} ({logData.msgCtn?.value} messages)</p>
                    <p><strong>Most Mentioned User:</strong> {logData.repCTN?.key} ({logData.repCTN?.value} mentions)</p>
                    <p><strong>XD Mentions:</strong> {logData.XDCTN?.key} ({logData.XDCTN?.value} mentions)</p>
                    <p><strong>Plus 1 Count:</strong> {logData.plusOne}</p>
                    <p><strong>Minus 1 Count:</strong> {logData.minusOne}</p>
                </div>
            ) : (
                <p>Loading latest log...</p>
            )}
        </div>
    );
};

export default ChatLog;
