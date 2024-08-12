import axios from "axios"
import { useEffect, useRef, useState } from 'react'
import './App.css'


const backendUrl = import.meta.env.VITE_BACKEND_URL
function App() {
  const [verified,setVerified]=useState(
    document.cookie.split('; ').some((cookie) => cookie.startsWith('authenticated='))
  )
  const [admin, setAdmin] = useState(false)
  const [add, setAdd] = useState(false)
  const [loading , setLoading]=useState(false)

  const [question, setQuestion] = useState({
    question: "",
    answer: ""
  })
  const fetchFlashcards = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backendUrl}/flashcard`)
      if (response.data.success) {
        setFlashcards(response.data.flashcards)
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error)
    }
    finally{
      setLoading(false)
    }
  }

  const [flashcards, setFlashcards] = useState([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  useEffect(() => {
    fetchFlashcards()
  }, [])

  useEffect(() => {
    const checkCookie = () => {
      const isVerified = document.cookie.split('; ').some((cookie) => cookie.startsWith('authenticated='));
      setVerified(isVerified);
    };

    const intervalId = setInterval(checkCookie, 1000); // Check every 1 second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const SubmitQuestion = async () => {
    try {
      setLoading(true)
      if (!question.id) {
        const resp = await axios.post(`${backendUrl}/flashcard`, JSON.stringify(question), {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (resp.data.success) {
          setQuestion({ question: "", answer: "" });
          setAdd(false);
          fetchFlashcards();
        }
        else {
          console.error("Some error occured ", resp.data.message)
        }
      } else {
        const resp = await axios.put(`${backendUrl}/flashcard/${question.id}`, JSON.stringify(question), {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (resp.data.success) {
          setQuestion({ question: "", answer: "" });
          setAdd(false);
          fetchFlashcards();
        }
        else {
          console.error("Some error occured ", resp.data.message)
        }
      }
    } catch (error) {
      console.error('Error submitting question:', error)
    }finally{
      setLoading(true)
    }
  }

  const nextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length)
  }

  const prevCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length)
  }

  return (
    <>
    {loading && <Loader/>}
      <div className="w-full h-[95vh] " >
        {admin ?
          <div className='w-full h-full p-3'>
            {!verified && <Gateway/>}
            <h2 className='text-center font-bold text-3xl my-2'>Admin Office</h2>
            <div className=' p-1'>
              <div className='flex justify-between my-2'>
                <button className=' px-2 py-3 bg-black text-white font-semibold rounded-md ' onClick={() => setAdd(true)} disabled={add}  > Add Flashcard</button>
                <div className="space-x-2">
                  <button className=' px-2 py-3 bg-red-500 text-white font-semibold rounded-md ' 
                  onClick={() =>{document.cookie = `authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;setVerified(false)}} disabled={add}> <i className="ph ph-lock text-lg"></i> Lock</button>
                  <button className=' px-2 py-3 bg-black text-white font-semibold rounded-md ' onClick={() => { setAdmin(false); setAdd(false) }} disabled={add}  >Public View</button>
                </div>

              </div>
              {
                flashcards.length > 0 && flashcards?.map((card, idx) => (
                  <AdminFlashCardView props={card} key={idx}
                    deleteFlashcard={async () => {
                      setLoading(true)
                      try {
                        const resp = await axios.delete(`${backendUrl}/flashcard/${card.id}`)
                        if (resp.data.success) {
                          fetchFlashcards()
                        }
                      } catch (error) {
                        console.log("Error occured", error.message)
                      }finally{
                        setLoading(true)
                      }
                    }}

                    editFlashcard={async () => {
                      try {
                        setAdd(true)
                        setQuestion(card)
                      } catch (error) {
                        console.log("Error occured", error.message)
                      }

                    }}
                  />
                ))
              }
              {add && <QuestionPopover questionValue={question.question} answerValue={question.answer} onChangeQuestion={(e) => setQuestion(prev => ({ ...prev, question: e.target.value }))} onChangeAnswer={(e) => setQuestion(prev => ({ ...prev, answer: e.target.value }))}
                onClickClear={() => {
                  setQuestion({ question: "", answer: "" })
                  setAdd(false)
                }}
                onClickSubmit={SubmitQuestion}
              />}

            </div>
          </div>
          :
          <div className='w-full h-full p-2'>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
              <img src="icon.png" className="w-12 sm:w-14" />
              <span className='text-2xl sm:text-3xl font-bold'>FlashCards</span>
            </div>

            <div className='flashcard-container relative w-full h-3/4 mt-7'>
              <div className='absolute inset-0 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg'></div>

              <div className='relative w-full h-full flex items-center p-2 sm:p-4'>
                <i
                  className="ph ph-arrow-fat-line-left text-xl sm:text-2xl cursor-pointer hover:text-gray-700 transition-colors"
                  onClick={prevCard}
                ></i>
                <div className='w-full h-full flex justify-center items-center'>
                  {flashcards.length > 0 && <FlashCard props={flashcards[currentCardIndex]} />}
                </div>
                <i
                  className="ph ph-arrow-fat-line-right text-xl sm:text-2xl cursor-pointer hover:text-gray-700 transition-colors"
                  onClick={nextCard}
                ></i>
              </div>
            </div>
          </div>
        }
        {!admin && <div className='flex justify-end items-center pr-5 cursor-pointer'>
          <a className='text-sm font-semibold text-right hover:underline' onClick={() => setAdmin(true)}>
            Admin?
          </a>

        </div>}
      </div>
    </>
  )
}


function Gateway() {
  const key = useRef(import.meta.env.VITE_PASSKEY);
  const passKey = useRef();

  const check = () => {
    if (passKey.current.value === key.current) {
      document.cookie = `authenticated=true; path=/; SameSite=Lax`;
      // Add your redirect or further action here
    } else {
      document.querySelector("#InputPasskey").classList.add("border-2", "border-red-500");
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-md z-20">
      <div className="flex flex-col w-11/12 sm:w-1/2 lg:w-1/3 p-6 bg-white rounded-lg shadow-lg">
        <input
          type="text"
          ref={passKey}
          className="p-2 mb-4 text-xl sm:text-2xl font-semibold border border-gray-300 rounded"
          id="InputPasskey"
          placeholder="Enter Passkey-121"
        />
        <button
          className="text-xl sm:text-2xl bg-black text-white font-semibold py-2 rounded hover:bg-gray-800 transition-colors"
          onClick={check}
        >
          Check Password
        </button>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-10 backdrop-blur-sm z-50">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-info motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      >
        <span
          className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
        >
          Loading...
        </span>
      </div>
    </div>
  );
}

function FlashCard({ props }) {
  const { question, answer, id } = props;
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [id]);

  return (
    <div
      className="relative w-11/12 sm:w-3/4 lg:w-1/4 min-h-[30vw] sm:min-h-[25vw] lg:min-h-[20vw] aspect-[3/2] cursor-pointer mx-auto"
      onClick={() => setIsFlipped((prev) => !prev)}
    >
      <div
        className={`w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''
          }`}
      >
        <div className="absolute w-full h-full backface-hidden">
          <div className="bg-red-700 z-5 w-full h-full p-2 text-white flex justify-center items-center break-words rounded-md overflow-y-auto overflow-x-hidden">
            {question}
          </div>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="bg-red-600 z-20 w-full h-full p-2 text-white flex justify-center items-center break-words rounded-md overflow-y-auto overflow-x-hidden">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionPopover({ onChangeQuestion, questionValue, answerValue, onChangeAnswer, onClickClear, onClickSubmit }) {
  return (
    <div className='flex flex-col absolute z-20 w-1/2 h-fit top-[25%] left-[20%] bg-white border-2 border-black rounded-md p-3 space-y-3'>
      <h2 className='font-semibold text-center text-xl'>Create Flashcard</h2>
      <input type="text" onChange={onChangeQuestion} value={questionValue} autoFocus placeholder='Question...' className='border-2 border-gray-600 rounded-md text-lg p-1' />
      <input type="text" onChange={onChangeAnswer} value={answerValue} placeholder='Answer..' className='border-2 border-gray-600 rounded-md text-lg p-1' />
      <div className='w-full flex items-center space-x-1'>
        <button className='text-white bg-black w-full font-semibold text-2xl px-2 py-3' onClick={onClickSubmit}>Upload</button>
        <button className='border-2 border-black rounded-md p-2'>
          <i className="ph ph-trash text-3xl hover:text-red-500" onClick={onClickClear}></i>
        </button>
      </div>
    </div>
  )
}

function AdminFlashCardView({ props, editFlashcard, deleteFlashcard }) {
  const { question, answer, id } = props

  return (
    <div className='flex w-full p-2 border-2 rounded-md border-black shadow-md my-1 justify-between'>
      <div className='w-full'>
        <div className='font-semibold'>
          Question:{question || ""}
        </div>
        <div className='text-lg font-semibold text-green-700'>
          Answer:{answer || ""}
        </div>
      </div>

      <div className='flex items-center justify-center flex-col'>
        <i className="ph ph-pencil text-3xl hover:text-blue-500" onClick={editFlashcard}></i>
        <i className="ph ph-trash text-3xl hover:text-red-500" onClick={deleteFlashcard}></i>
      </div>

    </div>
  )
}


export default App
