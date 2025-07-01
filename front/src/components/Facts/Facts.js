import React, { useState, useCallback } from 'react';
import './Facts.css'; // Import its own CSS

const DidYouKnowFacts = () => {
    const [didYouKnowFacts, setDidYouKnowFacts] = useState([]);
    const [newFact, setNewFact] = useState('');

    const addDidYouKnowFact = useCallback((factText) => {
        if (factText.trim()) {
            const newEntry = {
                id: Date.now(),
                text: factText,
                timestamp: Date.now(),
            };
            setDidYouKnowFacts((prevFacts) => [...prevFacts, newEntry]);
            setNewFact('');
        }
    }, []);

    return (
        <div className="did-you-know-card-panel">
            <h3>Did You Know?</h3>
            <div className="facts-list custom-scrollbar">
                {didYouKnowFacts.length > 0 ? (
                    didYouKnowFacts.map((fact, index) => (
                        <p key={fact.id} className="fact-entry">
                            <span className="bullet">•</span> {fact.text}
                        </p>
                    ))
                ) : (
                    <p className="empty-message">No fascinating facts yet. Enlighten us!</p>
                )}
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                addDidYouKnowFact(newFact);
            }} className="input-form">
                <input
                    type="text"
                    name="didYouKnowFact"
                    placeholder="Add a new cosmic fact..."
                    className="input-field"
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                />
                <button
                    type="submit"
                    className="submit-button"
                >
                    Add Fact
                </button>
            </form>
        </div>
    );
};

export default DidYouKnowFacts;