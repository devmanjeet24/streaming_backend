import mongoose from "mongoose";

const giftSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", required: true
    },
    
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    giftType: {
        type: String,
        required: true
    }, 
    // "rose", "crown", "fire"
    coinCost: {
        type: Number,
        required: true
    },
    
    diamondsEarned: {
        type: Number,
        required: true
    },
    
    roomId: {
        type: String,
        required: true
    },
    
}, {
    timestamps: true

});

export default mongoose.model("Gift", giftSchema);