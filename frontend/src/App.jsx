import axios from "axios"
import { useEffect, useState } from 'react'
import './App.css'


const backendUrl = import.meta.env.VITE_BACKEND_URL
function App() {
  const [admin, setAdmin] = useState(false)
  const [add, setAdd] = useState(false)
  const [question, setQuestion] = useState({
    question: "",
    answer: ""
  })
  const fetchFlashcards = async () => {
    try {
      const response = await axios.get(`${backendUrl}/flashcard`)
      if (response.data.success) {
        setFlashcards(response.data.flashcards)
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error)
    }
  }

  const [flashcards, setFlashcards] = useState([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  useEffect(() => {
    fetchFlashcards()
  }, [])


  const SubmitQuestion = async () => {
    try {
      // lame logic
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
      <div className="w-full h-[95vh] " >
        {admin ?
          <div className='w-full h-full p-3'>
            <h2 className='text-center font-bold text-3xl my-2'>Admin Office</h2>
            <div className=' p-1'>
              <div className='flex justify-between my-2'>
                <button className=' px-2 py-3 bg-black text-white font-semibold rounded-md ' onClick={() => setAdd(true)} disabled={add}  > Add Flashcard</button>
                <button className=' px-2 py-3 bg-black text-white font-semibold rounded-md ' onClick={() => { setAdmin(false); setAdd(false) }} disabled={add}  >Normal View </button>

              </div>
              {
                flashcards.length > 0 && flashcards?.map((card, idx) => (
                  <AdminFlashCardView props={card} key={idx}
                    deleteFlashcard={async () => {
                      try {
                        const resp = await axios.delete(`${backendUrl}/flashcard/${card.id}`)
                        if (resp.data.success) {
                          fetchFlashcards()
                        }
                      } catch (error) {
                        console.log("Error occured", error.message)
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
          <div className='w-full h-full p-2 '>
            <div className="flex items-center justify-center space-x-2">
              <img src="icon.png" className="w-14"/>
              <span className='text-3xl font-bold'>FlashCards</span>

            </div>
            <div className='flashcard-container relative w-full h-3/4 mt-7'>
              {/* Glassy background */}
              <div className='absolute inset-0 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg'></div>

              {/* Content */}
              <div className='relative w-full h-full flex items-center p-4'>
                <i className="ph ph-arrow-fat-line-left text-2xl cursor-pointer hover:text-gray-700 transition-colors" onClick={prevCard}></i>
                <div className='w-full h-full flex justify-center items-center'>
                  {flashcards.length > 0 && <FlashCard props={flashcards[currentCardIndex]} />}
                </div>
                <i className="ph ph-arrow-fat-line-right text-2xl cursor-pointer hover:text-gray-700 transition-colors" onClick={nextCard}></i>
              </div>
            </div>          </div>
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

function FlashCard({ props }) {
  const { question, answer, id } = props;
  const [isFlipped, setIsFlipped] = useState(false);
  useEffect(() => {
    setIsFlipped(false)
  }, [id])
  return (
    <div
      className="relative w-1/4 min-h-1/4 aspect-[3/2] cursor-pointer"
      onClick={() => setIsFlipped(prev => !prev)}
    >
      <div
        className={`w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''
          }`}
      >
        <div className="absolute w-full h-full backface-hidden">
          <div className="bg-red-700 z-20 w-full h-full p-2 text-white flex justify-center items-center break-words rounded-md">
            {question}
          </div>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="bg-red-600 z-20 w-full h-full p-2 text-white flex justify-center items-center break-words rounded-md">
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
        <button className='text-white bg-black w-full font-semibold text-2xl px-2 py-3' onClick={onClickSubmit}>Uplod</button>
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
