import { motion } from 'framer-motion';

/**
 * CheckoutStepper - Progress indicator for multi-step checkout
 * Shows current step and allows navigation to completed steps
 */
const CheckoutStepper = ({ currentStep, steps, onStepClick }) => {
    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between relative">
                {/* Progress Line Background */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />

                {/* Progress Line Active */}
                <motion.div
                    className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-primary to-cta -z-10"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isClickable = stepNumber < currentStep;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center relative z-10"
                        >
                            {/* Step Circle */}
                            <motion.button
                                onClick={() => isClickable && onStepClick?.(stepNumber)}
                                disabled={!isClickable}
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  transition-all duration-300 border-2
                  ${isCompleted
                                        ? 'bg-gradient-to-r from-primary to-cta text-white border-transparent cursor-pointer hover:scale-110'
                                        : isCurrent
                                            ? 'bg-white text-primary border-primary shadow-lg shadow-primary/25'
                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    }
                `}
                                whileHover={isClickable ? { scale: 1.1 } : {}}
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                            >
                                {isCompleted ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    stepNumber
                                )}
                            </motion.button>

                            {/* Step Label */}
                            <span className={`
                mt-2 text-xs font-medium text-center whitespace-nowrap
                ${isCurrent ? 'text-primary' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
              `}>
                                {step.label}
                            </span>

                            {/* Step Subtitle - Mobile Hidden */}
                            <span className="hidden md:block text-[10px] text-gray-400 text-center">
                                {step.subtitle}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CheckoutStepper;
