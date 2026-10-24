import { createDataset } from '../models/datasetModel'

const churnRows = [
  ['15634602', '42', 'France', '0', '1', '101348.88'], ['15647311', '41', 'Spain', '1', '1', '112542.58'],
  ['15619304', '39', 'France', '0', '1', '93826.63'], ['15701354', '31', 'Germany', '1', '0', '79084.10'],
  ['15737888', '44', 'France', '1', '2', '125510.82'], ['15734735', '29', 'Spain', '0', '1', '113755.78'],
  ['15592531', '35', 'Germany', '1', '2', '115046.74'], ['15565701', '37', 'France', '0', '4', '142051.07'],
  ['15591721', '43', 'France', '1', '1', '134603.88'], ['15587855', '44', 'France', '0', '3', '139513.00'],
]

const houseRows = [
  ['H-1001', '2019-04-12', '3', '2', '1840', 'Austin', '445000'], ['H-1002', '2019-05-03', '4', '3', '2460', 'Dallas', '589000'],
  ['H-1003', '2019-05-18', '2', '2', '1320', 'Houston', '318000'], ['H-1004', '2019-06-02', '5', '4', '3180', 'Austin', '795000'],
  ['H-1005', '2019-06-27', '3', '2', '2010', 'San Antonio', '410000'], ['H-1006', '2019-07-09', '4', '3', '2750', 'Dallas', '645000'],
  ['H-1007', '2019-07-22', '3', '2', '1690', 'Houston', '352000'], ['H-1008', '2019-08-14', '4', '3', '2320', 'Austin', '574000'],
]

const loanRows = [
  ['L-2001', '27', '52000', '680', '36', 'Employed', 'Approved'], ['L-2002', '41', '81000', '735', '48', 'Employed', 'Approved'],
  ['L-2003', '34', '46000', '610', '24', 'Self-employed', 'Review'], ['L-2004', '52', '99000', '770', '60', 'Employed', 'Approved'],
  ['L-2005', '25', '38000', '580', '36', 'Contractor', 'Declined'], ['L-2006', '38', '72000', '695', '48', 'Employed', 'Approved'],
  ['L-2007', '46', '67000', '640', '36', 'Self-employed', 'Review'], ['L-2008', '31', '55000', '625', '24', 'Employed', 'Approved'],
]

function rows(values, headers) {
  return values.map((value) => Object.fromEntries(headers.map((header, index) => [header, value[index]])))
}

export const SEEDED_DATASETS = [
  createDataset({
    id: 'dataset-customer-churn', name: 'Customer churn', source: 'Kaggle', projectIds: ['p1'], fileName: 'bank_churn.csv', fileSize: 2.4 * 1024 * 1024,
    headers: ['Customer ID', 'Age', 'Geography', 'Exited', 'NumOfProducts', 'Balance'], rows: rows(churnRows, ['Customer ID', 'Age', 'Geography', 'Exited', 'NumOfProducts', 'Balance']),
  }),
  createDataset({
    id: 'dataset-house-prices', name: 'House prices', source: 'HuggingFace', projectIds: ['p2'], fileName: 'house_prices.csv', fileSize: 1.8 * 1024 * 1024,
    headers: ['Property ID', 'Sale date', 'Bedrooms', 'Bathrooms', 'Square feet', 'City', 'Sale price'], rows: rows(houseRows, ['Property ID', 'Sale date', 'Bedrooms', 'Bathrooms', 'Square feet', 'City', 'Sale price']),
  }),
  createDataset({
    id: 'dataset-loan-approval', name: 'Loan approval', source: 'Kaggle', projectIds: ['p3'], fileName: 'loan_approval.csv', fileSize: 920 * 1024,
    headers: ['Application ID', 'Age', 'Annual income', 'Credit score', 'Term months', 'Employment', 'Decision'], rows: rows(loanRows, ['Application ID', 'Age', 'Annual income', 'Credit score', 'Term months', 'Employment', 'Decision']),
  }),
]
