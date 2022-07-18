import { abi, contractAddress } from './constants.js'
import { ethers } from './ethers-5.6.esm.min.js'

const connectButton = document.getElementById('connect-button')
const fundButton = document.getElementById('fund-button')
const balanceButton = document.getElementById('balance-button')
const withdrawButton = document.getElementById('withdraw-button')

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_requestAccounts' })
        console.log('connected')
        connectButton.innerHTML('Connected')
    } else {
        console.log('No metamask!')
        connectButton.innerHTML('Please install Metamask')
    }
}

async function fund() {
    const ethAmount = document.getElementById('ethAmount').value
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, abi, signer)
            const sendValue = ethers.utils.parseEther(`${ethAmount}`)
            const transactionResponse = await contract.fund({
                value: sendValue,
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log('Done!')
        } catch (error) {
            console.log(error)
        }
    }
}

async function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, _reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        console.log('provider...', provider)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function withdraw() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('Withdrawing...')
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, abi, signer)
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log('Done!')
        } catch (error) {
            console.log(error)
        }
    }
}
