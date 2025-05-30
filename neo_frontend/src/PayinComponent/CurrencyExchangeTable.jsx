import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from 'react-modal';
import axiosInstance from '../utils/axiosConfig';
import { FaEdit, FaEye, FaSync, FaCopy } from 'react-icons/fa';

const CurrencyExchangeTable = () => {
    const [currencyExchanges, setCurrencyExchanges] = useState([]);
    const [newExchange, setNewExchange] = useState({ currencyFrom: '', currencyTo: '', currencyJson: '', comments: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = currencyExchanges.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(currencyExchanges.length / itemsPerPage);

    const handleFirstPage = () => setCurrentPage(1);
    const handleLastPage = () => setCurrentPage(totalPages);
    const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    useEffect(() => {
        fetchCurrencyExchanges();
    }, []);

    const fetchCurrencyExchanges = async () => {
        try {
            const response = await axiosInstance.get('/api/currency-exchange');
            setCurrencyExchanges(response.data);
        } catch (error) {
            console.error('Error fetching currency exchanges:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewExchange({ ...newExchange, [name]: value });
    };

    const addCurrencyExchange = async () => {
        try {
            await axiosInstance.post('/api/currency-exchange', newExchange);
            fetchCurrencyExchanges();
            setNewExchange({ currencyFrom: '', currencyTo: '', currencyJson: '', comments: '' });
        } catch (error) {
            console.error('Error adding currency exchange:', error);
        }
    };

    const deleteCurrencyExchange = async (id) => {
        try {
            await axiosInstance.delete(`/api/currency-exchange/${id}`);
            fetchCurrencyExchanges();
        } catch (error) {
            console.error('Error deleting currency exchange:', error);
        }
    };

    return (
        <div className="container mt-2">
            <div className="container-fluid card py-4">
                {/* Search, filters, add, edit, and export buttons */}
                <div className="row ">
                    <h4>Currency Exchange API</h4>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-bordered border-color bg-color custom-bg-text">
                                <tr>
                                    <th>ID</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th title='Amount To Convert'>Amount</th>
                                    <th title='Converted Amount'>Converted Amt.</th>
                                    <th title='Conversion Rates'>C.Rates</th>
                                    <th>Timestamp</th>
                                    <th>JSON</th>
                                    <th>Comments</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((exchange) => (
                                    <tr key={exchange.id}>
                                        <td>{exchange.id}</td>
                                        <td>{exchange.currencyFrom}</td>
                                        <td>{exchange.currencyTo}</td>
                                        <td>{exchange.amountToConvert}</td>
                                        <td>{exchange.convertedAmount}</td>
                                        <td>{exchange.conversionRates}</td>
                                        <td>{exchange.formattedTimestamp}</td>
                                        <td>{exchange.currencyJson}</td>
                                        <td>{exchange.comments}</td>
                                        <td>
                                            <button className="btn btn-danger" onClick={() => deleteCurrencyExchange(exchange.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination controls */}
                        <div className="pagination justify-content-end">
                            <button onClick={handleFirstPage} disabled={currentPage === 1} className="btn btn-secondary mx-1">&laquo;&laquo;</button>
                            <button onClick={handlePreviousPage} disabled={currentPage === 1} className="btn btn-secondary mx-1">&laquo;</button>

                            {Array.from({ length: totalPages }, (_, index) => {
                                if (
                                    index + 1 === 1 ||
                                    index + 1 === totalPages ||
                                    (index + 1 >= currentPage - 1 && index + 1 <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={index + 1}
                                            onClick={() => paginate(index + 1)}
                                            className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-secondary'} mx-1`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                } else if (
                                    (index + 1 === currentPage - 2 || index + 1 === currentPage + 2) &&
                                    totalPages > 5
                                ) {
                                    return <span key={index + 1} className="mx-1">...</span>;
                                }
                                return null;
                            })}

                            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="btn btn-secondary mx-1">&raquo;</button>
                            <button onClick={handleLastPage} disabled={currentPage === totalPages} className="btn btn-secondary mx-1">&raquo;&raquo;</button>
                        </div>

                        <h2 className="mt-4">Add New Exchange</h2>
                        <div className="row mb-2">
                            <div className="d-flex justify-content-between bd-highlight flex-row gap-3">
                                <div className='col-md-3'>
                                <input
                                    type="text"
                                    name="currencyFrom"
                                    className='form-control'
                                    placeholder="Currency From"
                                    value={newExchange.currencyFrom}
                                    onChange={handleInputChange}
                                />
                                </div>
                                <div className='col-md-3'>
                                <input
                                    type="text"
                                    name="currencyTo"
                                    className='form-control'
                                    placeholder="Currency To"
                                    value={newExchange.currencyTo}
                                    onChange={handleInputChange}
                                />
                                </div>
                                <div className='col-md-3'>
                                <input
                                    type="number"
                                    name="amountToConvert"
                                    className='form-control'
                                    placeholder="Amount"
                                    value={newExchange.amountToConvert}
                                    onChange={handleInputChange}
                                />
                                </div>
                                <div className='col-md-3'>
                                <input
                                    type="text"
                                    name="comments"
                                    className='form-control'
                                    placeholder="Comments"
                                    value={newExchange.comments}
                                    onChange={handleInputChange}
                                />
                                </div>
                            </div>
                        </div>
                           <button className='btn btn-primary' onClick={addCurrencyExchange}>Add Exchange</button>
                            
                    </div>

                    <ToastContainer />
                </div>
            </div>
        </div>
    );
};

export default CurrencyExchangeTable;