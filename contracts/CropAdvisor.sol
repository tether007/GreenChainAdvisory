// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CropAdvisor {
    address public owner;
    uint256 public analysisPrice = 0.001 ether; // ~$2.50 at current ETH prices
    
    struct Analysis {
        address farmer;
        string imageHash;
        string diagnosis;
        string advice;
        uint256 timestamp;
        bool completed;
    }
    
    mapping(uint256 => Analysis) public analyses;
    mapping(address => uint256[]) public farmerAnalyses;
    uint256 public analysisCounter;
    
    event PaymentReceived(address indexed farmer, uint256 indexed analysisId, uint256 amount);
    event AnalysisCompleted(uint256 indexed analysisId, string diagnosis, string advice);
    event PriceUpdated(uint256 newPrice);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function requestAnalysis(string memory _imageHash) external payable returns (uint256) {
        require(msg.value >= analysisPrice, "Insufficient payment");
        
        uint256 analysisId = analysisCounter++;
        
        analyses[analysisId] = Analysis({
            farmer: msg.sender,
            imageHash: _imageHash,
            diagnosis: "",
            advice: "",
            timestamp: block.timestamp,
            completed: false
        });
        
        farmerAnalyses[msg.sender].push(analysisId);
        
        emit PaymentReceived(msg.sender, analysisId, msg.value);
        
        // Refund excess payment
        if (msg.value > analysisPrice) {
            payable(msg.sender).transfer(msg.value - analysisPrice);
        }
        
        return analysisId;
    }
    
    function completeAnalysis(
        uint256 _analysisId,
        string memory _diagnosis,
        string memory _advice
    ) external onlyOwner {
        require(_analysisId < analysisCounter, "Analysis does not exist");
        require(!analyses[_analysisId].completed, "Analysis already completed");
        
        analyses[_analysisId].diagnosis = _diagnosis;
        analyses[_analysisId].advice = _advice;
        analyses[_analysisId].completed = true;
        
        emit AnalysisCompleted(_analysisId, _diagnosis, _advice);
    }
    
    function getAnalysis(uint256 _analysisId) external view returns (Analysis memory) {
        require(_analysisId < analysisCounter, "Analysis does not exist");
        return analyses[_analysisId];
    }
    
    function getFarmerAnalyses(address _farmer) external view returns (uint256[] memory) {
        return farmerAnalyses[_farmer];
    }
    
    function updatePrice(uint256 _newPrice) external onlyOwner {
        analysisPrice = _newPrice;
        emit PriceUpdated(_newPrice);
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner).transfer(balance);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}