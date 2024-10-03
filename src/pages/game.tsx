import { useEffect, useState } from "react";
import { PiRanking } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import he from "he";
import sucessAnimation from "../assets/lotties/triviasuccess.json";
import failureAnimation from "../assets/lotties/triviafailure.json";
import Lottie from "lottie-react";

export function GamePage() {
  const location = useLocation();
  const { questions, settings } = location.state || {};
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answerResult, setAnswerResult] = useState<
    "success" | "failure" | null
  >(null);

  useEffect(() => {
    if (questions && questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      const decodedQuestion = decodeAndShuffleAnswers(currentQuestion);
      setAnswers(decodedQuestion);
    }
  }, [currentQuestionIndex, questions]);

  const decodeAndShuffleAnswers = (question: {
    correct_answer: string;
    incorrect_answers: string[];
    type: string;
  }) => {
    const correctAnswer = he.decode(question.correct_answer);
    const incorrectAnswer = question.incorrect_answers.map((answer) =>
      he.decode(answer)
    );

    const answersArray =
      question.type === "boolean"
        ? ["True", "False"]
        : [correctAnswer, ...incorrectAnswer];

    return shuffleArray(answersArray);
  };

  const shuffleArray = (array: string[]) => {
    return array.sort(() => Math.random() * 0.5);
  };

  const handleSelectedAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleConfirmAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = he.decode(currentQuestion.correct_answer);

    if (selectedAnswer === correctAnswer) {
      setScore((prevScore) => prevScore + 1);
      setAnswerResult("success");
    } else {
      setAnswerResult("failure");
    }

    setTimeout(() => {
      setAnswerResult(null);
      handleNextQuestion();
    }, 1000);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer("");

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      saveQuizHistory();
      navigate("/", { state: { finalScore: score } });
    }
  };

  const saveQuizHistory = () => {
    const existingHistory = JSON.parse(
      localStorage.getItem("quizHistory") || "[]"
    );
    const currentPlay = {
      timestamp: new Date().toISOString(),
      score: score,
      totalQuestions: questions.length,
      category: settings.category,
      difficulty: settings.difficulty,
      questionType: settings.questionType,
    };

    const updatedHistory = [...existingHistory, currentPlay];

    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  };

  const handleRestart = () => {
    navigate("/");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const questionText = he.decode(currentQuestion.question);
  const correctAnswer = he.decode(currentQuestion.correct_answer);

  return (
    <div className="min-h-screen flex w-full flex-col items-center justify-center text-center bg-gradient-to-r from-blue-900 to-blue-600 relative">
      <div className="absolute w-full top-4 flex flex-row items-center justify-between px-6 text-white">
        <div className="flex flex-col justify-center items-center gap-1 cursor-pointer">
          <PiRanking size={30} />
          <div>Rank</div>
        </div>
        <div className="flex flex-col justify-center items-center gap-1 cursor-pointer">
          <div className="text-xl flex flex-row gap-1 font-bold">
            <div>Score:</div>
            <div>{score}</div>
          </div>
          <button
            onClick={handleRestart}
            className="bg-red-500 text-white px-4 py-2 rounded-md mt-1"
          >
            Restart
          </button>
        </div>
      </div>

      <div className="text-white text-xl font-bold mt-4">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      <div className="mt-4 text-2xl text-white">{currentQuestion.category}</div>

      <div className="bg-white px-4 py-4 rounded-lg mt-6 text-lg">
        {questionText}
      </div>

      <div className="w-full flex flex-col max-w-2xl mt-4 gap-3">
        {answers.map((answer, index) => {
          let buttonClass = "bg-white text-gray-800";

          if (selectedAnswer == answer) {
            buttonClass = "bg-blue-400 text-white";
          }

          if (answerResult && answer === correctAnswer) {
            buttonClass = "bg-green-600 text-white";
          } else if (
            answerResult &&
            answer === selectedAnswer &&
            selectedAnswer !== correctAnswer
          ) {
            buttonClass = "bg-red-600 text-white";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelectedAnswer(answer)}
              className={`rounded-lg py-3 ${buttonClass}`}
            >
              {answer}
            </button>
          );
        })}
      </div>

      <button
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md"
        onClick={handleConfirmAnswer}
      >
        Confirm
      </button>

      {answerResult === "success" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <Lottie
            animationData={sucessAnimation}
            loop={true}
            className="w-72"
          />
        </div>
      )}

      {answerResult === "failure" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <Lottie
            animationData={failureAnimation}
            loop={true}
            className="w-72"
          />
        </div>
      )}
    </div>
  );
}
