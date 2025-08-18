// src/App.js

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

    // Fetch all transactions from the backend
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(API_URL);
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction((prev) => ({ ...prev, [name]: value }));
    };

    // Handle adding or updating a transaction
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTransactionId) {
                // Update existing transaction
                await axios.put(`${API_URL}/${editingTransactionId}`, newTransaction);
                setEditingTransactionId(null);
            } else {
                // Add new transaction
                await axios.post(API_URL, newTransaction);
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
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Personal Finance Tracker</h1>

                {/* Transaction Form */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">{editingTransactionId ? 'Edit Transaction' : 'Add New Transaction'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                            type="text"
                            name="description"
                            value={newTransaction.description}
                            onChange={handleChange}
                            placeholder="Description"
                            required
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <input
                            type="number"
                            name="amount"
                            value={newTransaction.amount}
                            onChange={handleChange}
                            placeholder="Amount"
                            required
                            step="0.01"
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <input
                            type="date"
                            name="date"
                            value={newTransaction.date}
                            onChange={handleChange}
                            required
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <select
                            name="type"
                            value={newTransaction.type}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <button
                            type="submit"
                            className="md:col-span-2 lg:col-span-4 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                        >
                            {editingTransactionId ? 'Update Transaction' : 'Add Transaction'}
                        </button>
                    </form>
                </div>

                {/* Transaction List */}
                <div className="bg-white p-6 rounded-lg shadow-inner">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Recent Transactions</h2>
                    <ul className="space-y-4">
                        {transactions.map((transaction) => (
                            <li
                                key={transaction.id}
                                className={`p-4 rounded-lg flex justify-between items-center shadow-sm ${
                                    transaction.type === 'income' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="font-bold text-lg text-gray-800">{transaction.description}</div>
                                    <div className="text-gray-600 text-sm">{transaction.date}</div>
                                </div>
                                <div className="text-xl font-bold flex items-center">
                  <span className={`${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    ${transaction.amount}
                  </span>
                                    <div className="ml-4 space-x-2">
                                        <button
                                            onClick={() => handleEditClick(transaction)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L1.5 15.672V19h3.328l9.873-9.873-2.828-2.828z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(transaction.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
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
