import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { AiFillFileExcel } from "react-icons/ai";
import {
  getAllTransactions,
  getFilteredTransactions,
} from "../../../helpers/transaction.helper";
import Context from "../../../context/Context.js";
import Loading from "../../Loading.js";
import { CSVLink } from "react-csv";
import moment from "moment";
import TransactionsTable from "../TransactionsTable";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

function AllTransactions() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();
  //used for pagination. skipcount used in mongo db skip()
  const [skipCount, setSkipCount] = useState(0);
  //used for pagination. limit number of documents fetched. used in mongo db limit()
  const [documentLimit, setDocumentLimit] = useState(10);
  const [excelFullData, setExcelFullData] = useState([]);
  const [filteredExcelFullData, setFilteredExcelFullData] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser, transactions, setTransactions } = useContext(Context);
  const csvRef = useRef();

  //filter related
  const [isFiltered, setIsFiltered] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();


  const generateFilteredExcelData = () =>{
    const myPromise = getFilteredTransactions(startDate, endDate, 0, 0);
    toast.promise(myPromise, {
      loading: 'Generating data',
      success: 'File generated, check downloads.',
      error: 'Error when generating data',
    });
    myPromise.then((res) => {
      if (res.data.success) {
        setFilteredExcelFullData(generateDataForExcel(res.data.transactions))
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }

  const generateDataForExcel = (transactions) => {
    const data = transactions.filter(item => item.status === "active").map((item) => {
      const {
        user,
        createdAt,
        updatedAt,
        __v,
        _id,
        from_date,
        to_date,
        customer_name,
        customer_mobile,
        fuel_mode,
        fuel_required,
        fuel_rate,
        fuel_expense,
        ...rest
      } = item;
      const newFromDate = moment(from_date).utc().format("DD-MM-YYYY");
      const newToDate = moment(to_date).utc().format("DD-MM-YYYY");
      const month = moment(from_date).utc().format("MMMM");
      const year = moment(from_date).utc().format("YYYY");
      return {
        ID: _id,
        customer_name,
        customer_mobile,
        from_date: newFromDate,
        to_date: newToDate,
        month,
        year,
        ...rest,
      };
    });
    return data;
  };

  useEffect(() => {
      if (isFiltered) {
        getFilteredTransactions(startDate, endDate, documentLimit, skipCount)
          .then((res) => {
            if (res.data.success) {
              setFilteredTransactions(res.data.transactions);
              if (!user) setUser(res.data.user);
              setIsLoading(false);
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error("Failed to receive data");
          });
      } else {
        getAllTransactions(documentLimit, skipCount)
          .then((res) => {
            if (res.data.success) {
              setTransactions(res.data.transactions);
              setFilteredTransactions(res.data.transactions);
              if (!user) setUser(res.data.user);
              setIsLoading(false);
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error("Failed to receive data");
          });
      }
  }, [skipCount]);

  const filterData = () => {
    if(!startDate || !endDate){
      toast.error("Invalid date")
      return;
    }


    if (!isFiltered) {
      getFilteredTransactions(startDate, endDate, documentLimit, skipCount)
        .then((res) => {
          if (res.data.success) {
            toast.success("Data filtered");
            setFilteredTransactions(res.data.transactions);
            setIsFiltered(true);
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("Failed to apply filter");
        });
    } else {
      setSkipCount(0);
      setDocumentLimit(10);
      getAllTransactions(documentLimit, skipCount)
        .then((res) => {
          if (res.data.success) {
            setTransactions(res.data.transactions);
            setFilteredTransactions(res.data.transactions);
            if (!user) setUser(res.data.user);
            setStartDate("");
            setEndDate("");
            setIsFiltered(false);
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("Failed to receive data");
        });
    }
  };

  useEffect(() => {
    if (excelFullData.length > 0 && csvRef.current && csvRef.current.link) {
      setTimeout(() => {
        csvRef.current.link.click();
        setExcelFullData([]);
      });
    }
  }, [excelFullData]);

  useEffect(() => {
    if (filteredExcelFullData.length > 0 && csvRef.current && csvRef.current.link) {
      setTimeout(() => {
        csvRef.current.link.click();
        setFilteredExcelFullData([]);
      });
    }
  }, [filteredExcelFullData]);

  const fetchAllTransactions = () => {
    getAllTransactions(0, 0)
      .then((res) => {
        if (res.data.success) {
          let exceldata = generateDataForExcel(res.data.transactions);
          setExcelFullData(exceldata);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to receive data");
      });
  };
  const loadNext = () => {
    setSkipCount((prevState) => prevState + documentLimit);
  };
  const loadPrevious = () => {
    setSkipCount((prevState) => prevState - documentLimit);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (user?.total_transactions === 0) {
    return (
      <div className="text-center w-full py-10">
        <p className="font-medium">You dont have any transactions yet!</p>
        <Link
          className="underline underline-offset-2 text-sm text-gray-600"
          to="/add"
        >
          Add new transaction
        </Link>
      </div>
    );
  }

  return (
    <section className="p-5 md:p-10 bg-gray-100 min-h-screen">
      <section class="container px-4 mx-auto">
        <h2 className="text-xl mb-4 font-semibold">Transactions</h2>
        <div className="flex gap-x-3">
          <button
            onClick={fetchAllTransactions}
            class="w-fit mb-5 flex items-center rounded-md border border-1 border-green-500 px-3 py-1 text-sm font-medium text-gray-600 transition-colors duration-200 sm:text-sm sm:px-3  gap-x-2 hover:bg-white"
          >
            <AiFillFileExcel className="w-4 h-4 text-green-500" />

            <span className="">Export All Data</span>
          </button>
          <button
            onClick={generateFilteredExcelData}
            class="w-fit mb-5 flex items-center rounded-md border border-1 border-green-500 px-3 py-1 text-sm font-medium text-gray-600 transition-colors duration-200 sm:text-sm sm:px-3  gap-x-2 hover:bg-white"
          >
            <AiFillFileExcel className="w-4 h-4 text-green-500" />

            <span className="">Export Filtered Data</span>
          </button>

          {/* <CSVLink
            data={generateFilteredExcelData()}
            filename="Filtered Report"
            className="w-fit mb-5 flex items-center rounded-md border border-1 border-green-500 px-3 py-1 text-sm font-medium text-gray-600 transition-colors duration-200 sm:text-sm sm:px-3  gap-x-2 hover:bg-white"
          >
            <AiFillFileExcel className="w-4 h-4 text-green-500" />

            <span className="">Export Filtered Data</span>
          </CSVLink> */}
        </div>
        {excelFullData.length > 0 && (
          <CSVLink ref={csvRef} data={excelFullData} filename="Report" />
        )}
        {filteredExcelFullData.length > 0 && (
          <CSVLink ref={csvRef} data={filteredExcelFullData} filename="Filtered Report" />
        )}
        <div className="flex my-8 gap-x-4 items-end">
          <div className="">
            <label htmlFor="date" className="block text-gray-700 text-sm">
              Start Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              placeholder=""
              name="start_date"
              className="block  mt-2 w-full placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
              max={moment().format("YYYY-MM-DD")}
              {...register("start_date", {
                required: "Date is required",
              })}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="">
            <label htmlFor="date" className="block text-gray-700 text-sm">
              End Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              placeholder=""
              name="end_date"
              className="block  mt-2 w-full placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
              max={moment().format("YYYY-MM-DD")}
              {...register("end_date", {
                required: "Date is required",
              })}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            onClick={handleSubmit(filterData)}
            className="flex items-center gap-x-2 px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
          >
            {isFiltered ? "Clear Filter" : "Filter"}
          </button>
        </div>
        <div class="flex flex-col">
          <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <TransactionsTable data={filteredTransactions} />
            </div>
          </div>
          <div class=" w-full flex flex-row-reverse items-center justify-between mt-6">
            <button
              onClick={loadNext}
              href="#"
              class="flex justify-self-end items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 "
            >
              <span>Next</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 rtl:-scale-x-100"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </button>

            {skipCount > 0 && (
              <button
                onClick={loadPrevious}
                href="#"
                class="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5 rtl:-scale-x-100"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                  />
                </svg>

                <span>previous</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

export default AllTransactions;
