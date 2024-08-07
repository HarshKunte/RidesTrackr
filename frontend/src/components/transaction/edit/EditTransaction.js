import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  editTransaction,
  getTransactionById,
} from "../../../helpers/transaction.helper";
import Loading from "../../Loading";
import NewTransactionForm from "../create/NewTransactionForm";
import Context from "../../../context/Context";
function EditTransaction() {
  const [state, setState] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const { transactionId } = useParams();
  const { setViewingTransaction } = useContext(Context);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  const getData = async () => {
    try {
      const res = await getTransactionById(transactionId);
      if (res.data?.success) {
        setState(res.data?.transaction);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to receive data!");
    }
  };

  const submitData = () => {
    setIsSaving(true)
    if (state.from_address === "") {
      setError("from_address", {
        type: "required",
        message: "Required",
      });
      return;
    }
    if (state.to_address === "") {
      setError("from_address", {
        type: "required",
        message: "Required",
      });
      return;
    }

    editTransaction(state, transactionId)
      .then((res) => {
        if (res.data?.success) {
          let id = res.data.transaction._id;
          setViewingTransaction(null)
          setIsSaving(prev=>!prev)
          navigate(`/view/${id}`);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Update failed!");
      });
  };

  useEffect(() => {
    getData();
  }, []);

  if (!state) {
    return <Loading />;
  }

  return (
    <section className="p-5 md:p-10">
      <h2 className="text-lg font-semibold mb-10 text-gray-700 capitalize">
        Edit transaction
      </h2>
      <NewTransactionForm
        setState={setState}
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        state={state}
        submitData={submitData}
        setError={setError}
        clearErrors={clearErrors}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
      />
    </section>
  );
}

export default EditTransaction;
