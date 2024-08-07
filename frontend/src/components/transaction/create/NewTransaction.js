import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import NewTransactionForm from "./NewTransactionForm";
import {toast} from 'react-hot-toast'
import { createTransaction } from "../../../helpers/transaction.helper";
import { useNavigate } from "react-router-dom";
import Context from "../../../context/Context";
function NewTransaction() {
  const initialState = {
    customer_name: "",
    customer_mobile: "",
    company_crn: "",
    from_date: "",
    to_date: "",
    no_of_days: "",
    from_address: "",
    to_address: "",
    round_trip: false,
    charged_lumpsum: false,
    starting_kms: 0,
    closing_kms: 0,
    total_kms: 0,
    rate_per_km: 0,
    rate_per_hr: 0,
    driver_allowance: 0,
    ride_mode: "",
    fuel_mode: "",
    fuel_required: 0,
    fuel_expense: 0,
    fuel_rate: 0,
    toll_amt: 0,
    tax_amt: 0,
    company_commission: 0,
    total_bill: 0,
    payment_mode: "",
    earnings: 0,
    payment_received: "yes",
    pending_payment_amt: 0
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  const [state, setState] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false)
  const {transactions, setTransactions, setViewingTransaction} = useContext(Context)
  const navigate = useNavigate()

  const submitData = () => {  
    console.log(state);

    setIsSaving(true)
    createTransaction(state)
    .then((res) =>{
      setIsSaving(prev => !prev)
      setViewingTransaction(null)
      if(transactions)
      setTransactions(prev => [...prev, res.data.transaction])
       toast.success("Created successfully!!")
       navigate(`/view/${res.data.transaction._id}`)
       setState(initialState)
    })
    .catch(err =>{
      setIsSaving(prev => !prev)
      toast.error('Failed to save data')
      console.log(err);
    })


  };

  return (
    <section className="p-5 md:p-10">
    <h2 className="text-lg font-semibold mb-10 text-gray-700 capitalize">
          Add new transaction
        </h2>
    <NewTransactionForm
      setState={setState}
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      state={state}
      submitData={submitData}
      setError = {setError}
      clearErrors={clearErrors}
      isSaving={isSaving}
    />
    </section>
  );
}

export default NewTransaction;
