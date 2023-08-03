import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const showAccount = document.getElementById('showAccount')
const purchaseButton = document.getElementById('purchaseButton')
const bnbInput = document.getElementById('bnbInput')
const novisInput = document.getElementById('novisInput')
const BNB_TO_TOKEN_RATE = 10000000000
const connecClaimtButton = document.getElementById("connecClaimtButton")
const getTokens = document.getElementById('claimTokens')

getTokens.onclick = tokenClaim;
connectButton.onclick = connect;
connecClaimtButton.onclick = connect;
purchaseButton.onclick = purchaseTokens;

async function calculateNovisAmount(bnbAmount) {
  try {
    const currentRate = await rate(); // Call the rate() function asynchronously
    const novisAmount = bnbAmount * parseFloat(currentRate); // Multiply with the rate
    novisInput.value = novisAmount.toFixed(2);
  } catch (error) {
    console.error(error);
  }
}

// Event listener for input change
bnbInput.addEventListener('input', (event) => {
  const bnbAmount = parseFloat(event.target.value);
  if (isNaN(bnbAmount)) {
    novisInput.value = '';
  } else {
    calculateNovisAmount(bnbAmount); // Call the async function to calculate novis amount
  }
});

/*bnbInput.addEventListener('input', (event) => {
  const bnbAmount = parseFloat(event.target.value);
  if (isNaN(bnbAmount)) {
    novisInput.value = '';
  } else {
    const novisAmount = bnbAmount * BNB_TO_TOKEN_RATE;
    novisInput.value = novisAmount.toFixed(2);
  }
});*/

async function connect() {
  const connectButton = document.getElementById("connectButton")
  const purchaseButton = document.getElementById("purchaseButton")
  const showAccount = document.getElementById("showAccount")
  const collectTokens = document.getElementById("claimTokens")
  const claimabletokens = document.getElementById("claimTokens")
  const swapRate = document.getElementById("token-rate")

  if (typeof window.ethereum !== 'undefined') {
    let provider = window.ethereum

    try {
      const chainId = await provider.request({
        method: 'eth_chainId'
      })

      console.log('This is Chain ID: ', chainId)

      if (chainId == '0xaa36a7') {
        await ethereum.request({ method: 'eth_requestAccounts' })
        connectButton.innerHTML = "Connecting..."
        connecClaimtButton.innerHTML = "Connecting..."

        tokensSold()
        progress()
        tokenInfo()
        const newRate = await rate()
        connectButton.innerHTML = "Connected"
        connectButton.style.backgroundColor = "#00FF00"
        connectButton.style.color = "#000000"
        connectButton.style.marginLeft = "10px"
        connecClaimtButton.style.marginLeft = "10px"
        connecClaimtButton.innerHTML = "Connected"
        connecClaimtButton.style.backgroundColor = "#00FF00"
        connecClaimtButton.style.color = "#000000"
        purchaseButton.style.display = "block"
        collectTokens.style.display = "block"
        claimabletokens.style.display = "block"
        swapRate.innerHTML = newRate

        const CurrentAccount = await ethereum.request({ method: "eth_accounts" })
        const accounts = CurrentAccount[0]
        console.log(accounts)
        showAccount.innerHTML = accounts
      } else {
        connectButton.innerHTML = "Switch to Sepolia network"
        connecClaimtButton.innerHTML = "Switch to Sepolia network"
      }
    } catch (error) {
      console.log(error)
      alert("Network error. Please check your MetaMask network settings.")
    }
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

async function purchaseTokens() {
  const amount = document.getElementById("bnbInput").value
  if (amount >= 0.01 && amount <= 5) {
    console.log(`Funding with ${amount}...`)
    alert("Please wait for wallet confirmation")
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const hasPresaleEnded = await contract.checkPresaleEnd()
        if(hasPresaleEnded == true){
          alert("Presale has ended")
          return
        }
        const hasPresaleStarted = await contract.checkPresaleStatus()
        if (hasPresaleStarted == true){
        const availibleTokens = await contract.getClaimableTokens()
        const avlTokens = ethers.utils.formatUnits(availibleTokens)
        console.log(avlTokens)
        if(avlTokens >= amount) {
        const transactionResponse = await contract.buyTokens({
          value: ethers.utils.parseEther(amount),
          gasLimit: 500000,
        })
        await listenForTransactionMine(transactionResponse, provider)
        console.log("Done")
        alert("Tokens Bought! Kindly wait for claim period to start.")
      }
      else {
        alert("not enought tokens availible to be sold at this moment")
      }
      } else{
        alert("Presale has not started")
      }
      } catch (error) {
        console.log(error)
      }
    } else {
      purchaseButton.innerHTML = "Please install MetaMask"
    } 
  } else {
    alert("Please enter amount more than 0.01 ETH and less than 5 ETH!")
  }
}

async function tokenClaim() {
    console.log('claiming Tokens')
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
          const checkStatus = await contract.checkPresaleEnd()
          if(checkStatus == true){
            const CurrentAccount = await ethereum.request({ method: "eth_accounts" })
            const accounts = CurrentAccount[0]
          const users = await contract.Customer(accounts.toString())
          const tokenAmount = users

          if(tokenAmount == 0 ){
            alert("No tokens left to be claimed")
            return
          }
        alert("Please wait for wallet confirmation")
        const transactionResponse = await contract.claimTokens()
        await listenForTransactionMine(transactionResponse, provider)
        console.log("Done")
        alert("Tokens claimed. Please import address 0x83564808b903295657671e9f96Cd748d6f8b926e into your wallet")
        const tokensLeft = users.tokensBought
        const tokensForClaim = document.getElementById('tokens-claim')
        tokensForClaim.innerText = ethers.utils.formatUnits(tokensLeft)
          }
          else {
            alert("Presale has not ended")
          }

        
      } catch (error) {
        console.log(error)
      }
    } else {
      purchaseButton.innerHTML = "Please install MetaMask"
    } 
  } 

  async function tokenInfo() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        signer
      );
      try {
    
    const CurrentAccount = await ethereum.request({ method: "eth_accounts" })
    const accounts = CurrentAccount[0]
		const users = await contract.Customer(accounts.toString())
    const tokensToBeClaimed = document.getElementById('tokens-claim')
    const tokenSCclaim = users
    tokensToBeClaimed.innerText = ethers.utils.formatUnits(tokenSCclaim)
    const claimStatus = document.getElementById('claimTime')
    const claimStarted = await contract.checkPresaleEnd()
    if(claimStarted == true){
      claimStatus.innerText = "Claim started"
    } else {
      claimStatus.innerText = "Presale Not Ended"
    }
  } catch (error){
		console.log(error)
	  }
    }
  }



async function progress() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const BNBearned = await contract.progress()
      const progressDiv = document.getElementById('progress');
      progressDiv.innerText = ethers.utils.formatUnits(BNBearned);
      updateProgressBar();
    } catch (error) {
      console.log(error)
      alert(error.message)
    }
  } else {
    purchaseButton.innerHTML = "Please install MetaMask"
  } 
}

async function updateProgressBar() {
  const progressBarRect = document.getElementById('progressBarRect');
  const progressBarContainer = document.querySelector('.section2__progressBarContainer');
  const progressBarWidth = progressBarContainer.offsetWidth - 4;
  const progressDiv = document.getElementById('progress');
  const BNBearned = parseFloat(progressDiv.innerText.replace(',', ''));
  const BNBstart = 0;
  const BNBend = 50;
  const progress = Math.max(0, Math.min((BNBearned - BNBstart) / (BNBend - BNBstart), 1));
  progressBarRect.style.width = progress * progressBarWidth + 'px';
}

async function tokensSold() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const totalSold = await contract.soldTokens()
      const tokensSoldDiv = document.getElementById('tokens-sold');
      tokensSoldDiv.innerText = ethers.utils.formatUnits(totalSold);
    } catch (error) {
      console.log(error)
      alert(error.message)
    }
  } else {
    const provider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/your-project-id")
    const contract = new ethers.Contract(contractAddress, abi, provider)
    const totalSold = await contract.soldTokens()
    const tokensSoldDiv = document.getElementById('tokens-sold');
    tokensSoldDiv.innerText = ethers.utils.formatUnits(totalSold);
  }
}

async function rate() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const rate = await contract.getRate();
      const newRate = rate.toString()
      return newRate
    } catch (error) {
      throw new Error(error.message);
    }
  } else {
    throw new Error("Please install MetaMask");
  } 
}

async function listenForTransactionMine(transactionResponse, provider) {
  const receipt = await provider.waitForTransaction(transactionResponse.hash)
  console.log(receipt)
  return receipt
}


const items = document.querySelectorAll('.accordion button');

function toggleAccordion() {
  const itemToggle = this.getAttribute('aria-expanded');

  for (i = 0; i < items.length; i++) {
    items[i].setAttribute('aria-expanded', 'false');
  }

  if (itemToggle == 'false') {
    this.setAttribute('aria-expanded', 'true');
  }
}

items.forEach((item) => item.addEventListener('click', toggleAccordion));