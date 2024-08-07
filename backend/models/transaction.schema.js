import mongoose from 'mongoose'
import {PaymentModes, RideModes} from '../util/enums.js'
import User from './user.schema.js'

const transactionSchema = mongoose.Schema(
    {
        _id:{
            type: String,
            required: true
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        },
        customer_name:{
            type: String,
            required: [true, "Customer name is required."]
        },
        customer_mobile:{
            type: String
        },
        company_crn:{
            type:String
        },
        from_address:{
            type: String,
            required: [true, "From address is required."]
        },
        to_address:{
            type: String,
            required: [true, "To address is required."]
        },
        round_trip:{
            type:Boolean,
            default: false
        },
        from_date:{
            type: Date,
            required: [true, "From date is required."]
        },
        to_date:{
            type: Date,
            required: [true, "To date is required."]
        },
        no_of_days:{
            type: Number
        },
        starting_kms:{
            type: Number,
            default:0
        },
        closing_kms:{
            type: Number,
            default:0
        },
        total_kms:{
            type: Number,
            default:0
        },
        rate_per_km:{
            type: Number,
        },
        rate_per_hour:{
            type: Number,
        },
        driver_allowance:{
            type: Number,
        },
        ride_mode:{
            type: String,
            enum: Object.keys(RideModes),
        },
        charged_lumpsum:{
          type: Boolean,
          default: false
        },
        total_bill:{
            type:Number,
            required: [true, "Total amount is required."]
        },
        payment_received:{
            type: String,
            default: "yes"
        },
        pending_payment_amt:{
            type: Number,
            default:0
        },
        toll_amt:{
            type:Number,
            default:0
        },
        tax_amt:{
            type:Number,
            default:0
        },
        company_commission:{
            type:Number,
            default:0
        },
        earnings:{
            type:Number,
            default:0
        },
        payment_mode:{
            type: String,
            enum: Object.values(PaymentModes),
            required: [true, "Payment mode is required."]
        },
        invoice_id:{
          type:String
        },
        invoice_date:{
          type: Date
        },
        status:{
          type: String,
            enum: ["active", "deleted"],
            default:"active"
        }
        
    },
    {
        _id: false,
        timestamps: true
    }
)

//method to calculate totals of kms, earnings, transactions and save to User Db
transactionSchema.pre('save', async function(next){
   if(this.isModified('to_date') || this.isModified('from_date')){
    this.from_date = new Date(this.from_date)
    this.to_date = new Date(this.to_date)
   }
   next()
  })

transactionSchema.post('save', async function(){
   if(this.isModified('to_date') || this.isModified('from_date')){
    this.from_date = new Date(this.from_date)
    this.to_date = new Date(this.to_date)
   }
    const userId = this.user._id
    User.aggregate([
        {
          "$match": {
            _id: userId
          }
        },
        {
          "$lookup": {
            "from": "transactions",
            "localField": "_id",
            "foreignField": "user",
            "as": "transactions"
          }
        },
        {
          "$project": {
            "transactions": {
              "$filter": {
                "input": "$transactions",
                "cond": {
                  "$eq": [
                    "$$this.status", "active"
                  ]
                }
              }
            }
          }
        },
        {
          "$addFields": {
            "total_kms": {
              "$sum": "$transactions.total_kms"
            },
            "total_earnings": {
              "$sum": "$transactions.earnings"
            },
            "total_bills_amt": {
              "$sum": "$transactions.total_bill"
            },
            "total_transactions": {
              "$size": "$transactions"
            },
            "total_no_of_days": {
              "$sum": "$transactions.no_of_days"
            }
          }
        },
        {
            "$unset": "transactions"
        },
        {
          "$merge": {
            "into": "users",
            "on": "_id",
            "whenMatched": "merge",
            "whenNotMatched": "discard"
          }
        }
      ]).then(res =>{
        console.log('ok');
      }).catch(err =>{
        console.log('Error',err);
      })
})
transactionSchema.post('findOneAndUpdate', async function(){
  const doc =  await this.model.findOne(this.getQuery());
    User.aggregate([
        {
          "$match": {
            _id: doc.user
          }
        },
        {
          "$lookup": {
            "from": "transactions",
            "localField": "_id",
            "foreignField": "user",
            "as": "transactions"
          }
        },
        {
          "$project": {
            "transactions": {
              "$filter": {
                "input": "$transactions",
                "cond": {
                  "$eq": [
                    "$$this.status", "active"
                  ]
                }
              }
            }
          }
        },
        {
          "$addFields": {
            "total_kms": {
              "$sum": "$transactions.total_kms"
            },
            "total_earnings": {
              "$sum": "$transactions.earnings"
            },
            "total_bills_amt": {
              "$sum": "$transactions.total_bill"
            },
            "total_transactions": {
              "$size": "$transactions"
            },
            "total_no_of_days": {
              "$sum": "$transactions.no_of_days"
            }
          }
        },
        {
            "$unset": "transactions"
        },
        {
          "$merge": {
            "into": "users",
            "on": "_id",
            "whenMatched": "merge",
            "whenNotMatched": "discard"
          }
        }
      ]).then(res =>{
        console.log('ok2');
      }).catch(err =>{
        console.log('Error',err);
      })

})




export default mongoose.model('Transaction', transactionSchema)