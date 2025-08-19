import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:8080/api/transactions';

function App() {
    const [transactions, setTransactions] = useState([]);
    const [newTransaction, setNewTransaction] = useState({
        description: '',
        amount: '',
        date: '',
        type: 'income',
    });
    const [editingTransactionId, setEditingTransactionId] = useState(null);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all transactions from the backend
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(API_URL);
            setTransactions(response.data);
            setMessage(null); // Clear message on successful fetch
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setMessage('Error fetching transactions.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction((prev) => ({ ...prev, [name]: value }));
    };

    // Handle adding or updating a transaction
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading state
        setMessage(null); // Clear previous messages

        // Log the data we are about to send to the backend
        console.log('Submitting transaction:', newTransaction);

        try {
            if (editingTransactionId) {
                // Update existing transaction
                await axios.put(`${API_URL}/${editingTransactionId}`, newTransaction);
                setMessage('Transaction updated successfully!');
                setEditingTransactionId(null);
            } else {
                // Add new transaction
                await axios.post(API_URL, newTransaction);
                setMessage('Transaction added successfully!');
            }
            setNewTransaction({
                description: '',
                amount: '',
                date: '',
                type: 'income',
            });
            fetchTransactions(); // Refresh the list
        } catch (error) {
            console.error('Error saving transaction:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Server response data:', error.response.data);
                console.error('Server response status:', error.response.status);
                setMessage(`Error: ${error.response.status} - ${error.response.data.message || 'Server error'}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                setMessage('Error: No response from server. Check if your backend is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Request setup error:', error.message);
                setMessage('Error saving transaction. Check your network connection.');
            }
        } finally {
            setIsLoading(false); // End loading state
        }
    };

    const handleEditClick = (transaction) => {
        setNewTransaction({
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date,
            type: transaction.type,
        });
        setEditingTransactionId(transaction.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchTransactions(); // Refresh the list
            setMessage('Transaction deleted successfully!');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            setMessage('Error deleting transaction.');
        }
    };

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-xl">
                <h1 className="text-4xl font-bold text-center text-gray-100 mb-8">Personal Finance Tracker</h1>

                {/* Message for user feedback */}
                {message && (
                    <div className={`p-4 mb-4 rounded-lg text-white font-bold ${message.startsWith('Error') ? 'bg-red-600' : 'bg-green-600'}`}>
                        {message}
                    </div>
                )}

                {/* Transaction Form */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-inner mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-100">{editingTransactionId ? 'Edit Transaction' : 'Add New Transaction'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                            type="text"
                            name="description"
                            value={newTransaction.description}
                            onChange={handleChange}
                            placeholder="Description"
                            required
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            disabled={isLoading}
                        />
                        <input
                            type="number"
                            name="amount"
                            value={newTransaction.amount}
                            onChange={handleChange}
                            placeholder="Amount"
                            required
                            step="0.01"
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            disabled={isLoading}
                        />
                        <input
                            type="date"
                            name="date"
                            value={newTransaction.date}
                            onChange={handleChange}
                            required
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-700 text-white border-gray-600"
                            disabled={isLoading}
                        />
                        <select
                            name="type"
                            value={newTransaction.type}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-700 text-white border-gray-600"
                            disabled={isLoading}
                        >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <button
                            type="submit"
                            className="md:col-span-2 lg:col-span-4 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (editingTransactionId ? 'Update Transaction' : 'Add Transaction')}
                        </button>
                    </form>
                </div>

                {/* Transaction List */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-100">Recent Transactions</h2>
                    <ul className="space-y-4">
                        {transactions.map((transaction) => (
                            <li
                                key={transaction.id}
                                className={`p-4 rounded-lg flex justify-between items-center shadow-sm bg-gray-700 ${
                                    transaction.type === 'income' ? 'border-l-4 border-blue-500' : 'border-l-4 border-red-500'
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-lg text-white">{transaction.description}</div>
                                    <div className="text-gray-300 text-sm">{transaction.date}</div>
                                </div>
                                <div className="text-xl font-bold flex items-center">
                  <span className={`${transaction.type === 'income' ? 'text-blue-400' : 'text-red-400'}`}>
                    ${transaction.amount}
                  </span>
                                    <div className="ml-4 space-x-2">
                                        <button
                                            onClick={() => handleEditClick(transaction)}
                                            className="text-blue-400 hover:text-blue-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L1.5 15.672V19h3.328l9.873-9.873-2.828-2.828z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(transaction.id)}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default App;