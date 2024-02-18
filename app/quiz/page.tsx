'use client';
import { useMachine } from '@xstate/react';
import { assign, fromCallback, setup } from 'xstate';


type QuestionItem = {
    id: string,
    title: string,
    completed: boolean,
    type: 'unique' | 'multiple',
    answers: string[],
}

const quizMachine = setup({
    types: {} as {
        context: {
            question: number;
            questions: QuestionItem[];
            elapsed: number;
        };
        events:
        | { type: 'question.next'; }
        | { type: 'question.finish'; }
        | { type: 'TICK'; }
        | { type: 'init'; }
        | { type: 'stopCounter'; };
    },
    actors: {
        ticks: fromCallback(({ sendBack }) => {
            const interval = setInterval(() => {
                sendBack({ type: 'TICK' });
            }, 999);
            return () => clearInterval(interval);
        }),
    }
}).createMachine({
    id: 'quiz',
    initial: 'idle',
    context: {
        question: 0,
        elapsed: 5,
        questions: [
            {
                id: '1',
                title: 'What to do ?',
                completed: false,
                type: 'unique',
                answers: [
                    'First choice',
                    'Second choice',
                ],
            },
            {
                id: '2',
                title: 'Second question ?',
                completed: false,
                type: 'multiple',
                answers: [
                    'First choice',
                    'Second choice',
                    'Third choice',
                ],
            }
        ]
    },
    states: {
        idle: {
            on: {
                init: 'running'
            }
        },
        running: {
            invoke: { src: 'ticks' },
            initial: 'firstQuestion',
            on: {
                'TICK': {
                    actions: assign({
                        elapsed: ({ context }) => {
                            return context.elapsed - 1;
                        }
                    })
                },
            },
            after: {
                5000: { target: 'running.nextQuestion', reenter: true }
            },
            always: {
                guard: ({ context }) => {
                    return context.question === 2
                },
                target: '#quiz.finished'
            },
            states: {
                firstQuestion: {},
                nextQuestion: { entry: [assign({ elapsed: 5, question: ({ context }) => context.question + 1 })] }
            }
        },
        finished: {
        }
    },
});

const RadioGroup = ({ answers }: { answers: string[] }) => {
    return answers.map(answer => (
        <li key={answer} className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
            <div className="flex items-center ps-3">
                <input id="list-radio-license" type="radio" value="" name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="list-radio-license" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{answer}</label>
            </div>
        </li>
    ))
}

const CheckboxGroup = ({ answers }: { answers: string[] }) => {
    return answers.map(answer => (
        <li key={answer} className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
            <div className="flex items-center ps-3">
                <input id="vue-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                <label htmlFor="vue-checkbox" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{answer}</label>
            </div>
        </li>
    ))
}

export default function Quiz() {
    const [state, send] = useMachine(quizMachine);

    const currentQuestion = state.context.questions[state.context.question]

    return (
        <div className='w-full flex justify-center flex-col items-center gap-4 h-full'>
            {
                state.matches('idle') && (
                    <button type="button" onClick={() => send({ type: 'init' })} className="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">START THE QUIZ</button>

                )
            }
            {
                (state.matches({ running: 'firstQuestion' }) || state.matches({ running: 'nextQuestion' })) && (
                    <>
                        <span className="bg-gray-100 text-gray-800 text-xl font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">TIMER: {state.context.elapsed}</span>


                        {
                            currentQuestion ? (
                                <>
                                    <h1 className="font-semibold text-gray-900 dark:text-white text-3xl">{currentQuestion.title}</h1>
                                    <ul className="w-96 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        {
                                            currentQuestion.type === 'multiple' ?
                                                <CheckboxGroup answers={currentQuestion.answers} />
                                                : <RadioGroup answers={currentQuestion.answers} />
                                        }
                                    </ul>
                                </>
                            ) : null
                        }
                    </>
                )
            }
            {
                state.matches('finished') && (
                    <span className='text-gray-900 text-4xl'>
                        LE QUIZ EST FINI 🥳
                    </span>
                )
            }
        </div>
    );
}