// PrintDateNote.jsx
import React from 'react';

export const PrintDateNote = ({ printDateNote, supportNote }) => {
    const noteText = printDateNote || supportNote || '';
    
    // Split and clean the entries, handling both \r and \n line breaks
    const entries = noteText
        .split(/\r|\n/)
        .filter(entry => entry.trim())
        .map(entry => entry.trim());

    return (
        <div className="table-responsive">
            <table className="table table-striped">
               
                <tbody>
                    {entries.length > 0 ? (
                        entries.map((entry, index) => {
                            const [date, ...messageParts] = entry.split(' | ');
                            const message = messageParts.join(' | ').trim();
                            return (
                                <tr 
                                    key={index} 
                                    style={{ 
                                        backgroundColor: index % 2 === 0 ? '#fff' : '#fff',
                                        borderBottom: '1px solid #dee2e6' 
                                    }}
                                >
                                    <td nowrap style={{ width: '15%', padding: '3px 3px 3px 8px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                                        {date?.trim() || 'N/A'}
                                    </td>
                                    <td style={{ width: '85%', padding: '3px', verticalAlign: 'top', wordWrap: 'anywhere' }}>
                                        {message || 'N/A'}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        
                        ``
                    )}
                </tbody>
            </table>
        </div>
    );
};
