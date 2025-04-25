'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { Transaction } from '@solana/web3.js';
import { connection } from '@/lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { HypernovaApi } from '@/lib/api-client';
import { Upload, ImageIcon } from 'lucide-react';
import { themedToast } from '@/lib/toast';

// CylinderSlider component for 3D slider controls
interface CylinderSliderProps {
  values: number[];
  currentValue: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
  color: string;
}

function CylinderSlider({ values, currentValue, onChange, label, unit = '', color }: CylinderSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate the closest value based on the drag position
  const handleChange = useCallback((clientY: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    // Invert the calculation for vertical orientation (bottom = 0, top = max)
    const position = 1 - ((clientY - rect.top) / rect.height);
    const index = Math.min(
      Math.max(Math.round(position * (values.length - 1)), 0),
      values.length - 1
    );
    
    onChange(values[index]);
  }, [onChange, values]);

  // Event handlers for mouse and touch interactions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleChange(e.clientY);
  }, [handleChange]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleChange(e.clientY);
    }
  }, [isDragging, handleChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Find the current index
  const currentIndex = values.indexOf(currentValue);
  const fillPercentage = currentIndex / (values.length - 1) * 100;
  
  // Get the three main break values - first, middle, and last
  const breakValues = [
    values[0],                                      // Min value
    values[Math.floor((values.length - 1) / 2)],    // Middle value
    values[values.length - 1]                       // Max value
  ];

  return (
    <div className="flex flex-col items-center h-full pt-10 pb-8 px-4">
      <label className="block text-sm text-gray-300 mb-4 text-center">{label}</label>
      
      {/* Glass container with proper spacing */}
      <div className="relative flex justify-center h-full w-full">
        <div 
          ref={sliderRef}
          className="relative w-20 h-[160px] cursor-pointer"
          style={{ perspective: '800px' }}
          onMouseDown={handleMouseDown}
        >
          {/* Glass container - outer */}
          <div 
            className="absolute inset-0 rounded-b-2xl rounded-t-xl bg-transparent shadow-lg"
            style={{ 
              transformStyle: 'preserve-3d',
              background: 'linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), inset 0 0 10px rgba(255,255,255,0.05)'
            }}
          >
            {/* Glass texture effects */}
            <div 
              className="absolute inset-[1px] rounded-b-2xl rounded-t-xl overflow-hidden"
              style={{
                background: 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
                backdropFilter: 'blur(5px)'
              }}
            >
              {/* Rim highlight */}
              <div 
                className="absolute inset-x-0 top-0 h-1 bg-white opacity-30 rounded-t-xl"
              ></div>
              
              {/* Side highlights */}
              <div 
                className="absolute left-0 inset-y-0 w-[1px] bg-white opacity-20"
              ></div>
              <div 
                className="absolute right-0 inset-y-0 w-[1px] bg-white opacity-10"
              ></div>
              
              {/* Empty glass texture */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%), linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.02) 100%)'
                }}
              ></div>
              
              {/* Liquid fill with juice appearance */}
              <div 
                className="absolute bottom-0 w-full transition-all duration-300 ease-out"
                style={{
                  height: `${fillPercentage}%`,
                  background: `linear-gradient(to top, ${color}, ${color}dd)`,
                  boxShadow: 'inset 0 5px 15px rgba(255,255,255,0.3)'
                }}
              >
                {/* Liquid surface highlight */}
                <div 
                  className="absolute inset-x-0 top-0 h-1 bg-white opacity-40"
                  style={{ boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                ></div>
                
                {/* Bubbles effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="bubble-sm absolute w-1 h-1 rounded-full bg-white opacity-70" 
                       style={{ left: '20%', bottom: '10%', animation: 'bubble 4s infinite ease-in' }}></div>
                  <div className="bubble-md absolute w-2 h-2 rounded-full bg-white opacity-50" 
                       style={{ left: '60%', bottom: '30%', animation: 'bubble 6s infinite ease-in 1s' }}></div>
                  <div className="bubble-sm absolute w-1 h-1 rounded-full bg-white opacity-60" 
                       style={{ left: '40%', bottom: '50%', animation: 'bubble 5s infinite ease-in 2s' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current value indicator with glass effect */}
          <div 
            className="absolute right-full pr-3 text-sm font-medium text-white transition-all duration-300"
            style={{ 
              top: `${100 - fillPercentage}%`, 
              transform: 'translateY(-50%)'
            }}
          >
            <div 
              className="px-2 py-1 rounded-md backdrop-blur-sm bg-gray-800/80"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              {currentValue}{unit}
            </div>
          </div>
          
          {/* Measurement bar with dashes on the right */}
          <div className="absolute left-full h-full pl-1.5">
            {/* Vertical measuring line */}
            <div className="absolute h-full w-[1px] bg-gray-700"></div>
            
            {/* Tick marks for all values */}
            {values.map((value, index) => {
              const position = 100 - (index / (values.length - 1) * 100);
              const isBreakValue = breakValues.includes(value);
              const isActive = value <= currentValue;
              
              return (
                <div 
                  key={index} 
                  className="absolute flex items-center cursor-pointer"
                  style={{ top: `${position}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value);
                  }}
                >
                  {/* Tick mark - longer for break values, shorter for others */}
                  <div 
                    className={`h-[1px] ${isBreakValue ? 'w-5' : 'w-2'} ${isActive ? 'bg-gray-300' : 'bg-gray-500'}`}
                  ></div>
                  
                  {/* Only show labels for the 3 break values */}
                  {isBreakValue && (
                    <span className={`ml-1.5 text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {value}{unit}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// DateVialSelector component for date selection with the same aesthetic as CylinderSlider
interface DateVialSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

// ThemeCalendar - a smaller calendar component with drop-up behavior
function ThemeCalendar({ selectedDate, onChange, minDate }: DateVialSelectorProps) {
  const [currentHours, setCurrentHours] = useState(selectedDate.getHours());
  const [currentMinutes, setCurrentMinutes] = useState(selectedDate.getMinutes());
  const [isOpen, setIsOpen] = useState(false);
  // Make sure viewDate starts with today
  const [viewDate, setViewDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  
  // Scroll to today when calendar opens
  useEffect(() => {
    if (isOpen && scrollRef.current && todayRef.current) {
      // Use a small timeout to ensure the calendar is fully rendered
      setTimeout(() => {
        if (todayRef.current) {
          todayRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'start'
          });
        }
      }, 100);
    }
  }, [isOpen]);
  
  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };
  
  // Generate dates for horizontal calendar
  const getDatesArray = () => {
    const dates = [];
    const startDate = new Date();
    
    // Generate 20 days starting from today (0 days before and 20 days after today)
    for (let i = 0; i < 20; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Format date for display
  const formatDay = (date: Date) => {
    const day = date.getDate();
    const suffix = getDaySuffix(day);
    return `${day}${suffix}`;
  };
  
  // Get day suffix (st, nd, rd, th)
  const getDaySuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  // Get day name abbreviation
  const getDayName = (date: Date) => {
    return date.toLocaleString('default', { weekday: 'short' });
  };
  
  // Navigate to previous month
  const handlePrevMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  };
  
  // Navigate to next month
  const handleNextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };
  
  // Handle date selection
  const handleDateClick = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(currentHours);
    newDate.setMinutes(currentMinutes);
    onChange(newDate);
  };
  
  // Handle time change
  const handleTimeChange = (type: 'hours' | 'minutes', value: number) => {
    if (type === 'hours') {
      setCurrentHours(value);
      const newDate = new Date(selectedDate);
      newDate.setHours(value);
      onChange(newDate);
    } else {
      setCurrentMinutes(value);
      const newDate = new Date(selectedDate);
      newDate.setMinutes(value);
      onChange(newDate);
    }
  };
  
  // Check if date is in the past (only disable dates before today)
  const isDateDisabled = (date: Date) => {
    if (!minDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0); // Set to beginning of day
    
    return compareDate < today;
  };
  
  // Check if date is selected
  const isDateSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  // Check if date is today
  const isDateToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Format time value (add leading zero)
  const formatTimeValue = (value: number) => {
    return value.toString().padStart(2, '0');
  };
  
  // Format time in AM/PM for preview
  const formatAmPm = (hours: number, minutes: number) => {
    const hour12 = hours % 12 || 12; // Convert 0 to 12
    const ampm = hours < 12 ? 'AM' : 'PM';
    return `${hour12}:${formatTimeValue(minutes)} ${ampm}`;
  };
  
  // Get dates for horizontal calendar
  const dates = getDatesArray();
  
  return (
    <div className="relative w-full">
      {/* Date display that acts as trigger */}
      <div 
        className="bg-gray-800/50 border border-gray-700 rounded-md p-2 cursor-pointer flex items-center justify-between"
        onClick={(e) => {
          e.preventDefault(); // Prevent any form submission
          setIsOpen(!isOpen);
        }}
      >
        <div className="text-white font-medium">
          {selectedDate.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        <div className="text-gray-400">
          {isOpen ? '▲' : '▼'}
        </div>
      </div>
      
      {/* Backdrop overlay with blur when calendar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Calendar dropdown */}
      {isOpen && (
        <div 
          ref={calendarRef}
          className="absolute bottom-full left-0 right-0 mb-2 z-50 transform-gpu transition-all duration-200 ease-out origin-bottom"
          style={{ 
            animation: 'slideUp 0.2s ease-out forwards',
          }}
        >
          <div className="w-full bg-gray-800/95 border border-gray-700 rounded-lg p-3 backdrop-blur-sm shadow-lg" 
               style={{ 
                 background: 'linear-gradient(to bottom right, rgba(30,30,40,0.95), rgba(15,15,25,0.98))',
                 boxShadow: '0 8px 25px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.07)'
               }}>
            
            {/* Time inputs */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white text-sm font-medium">Set Time:</div>
                <div className="text-purple-300 text-xs font-medium">
                  {formatAmPm(currentHours, currentMinutes)}
                </div>
              </div>
              <div className="flex items-center justify-center bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={currentHours}
                  onChange={(e) => {
                    e.preventDefault();
                    let value = parseInt(e.target.value) || 0;
                    if (value > 24) value = 24;
                    handleTimeChange('hours', value);
                  }}
                  className="w-16 h-10 bg-gray-900/70 border border-gray-700 rounded text-white text-center text-lg font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  style={{ 
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
                <span className="mx-3 text-purple-400 font-bold text-2xl">:</span>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={currentMinutes}
                  onChange={(e) => {
                    e.preventDefault();
                    let value = parseInt(e.target.value) || 0;
                    if (value > 60) value = 60;
                    handleTimeChange('minutes', value);
                  }}
                  className="w-16 h-10 bg-gray-900/70 border border-gray-700 rounded text-white text-center text-lg font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  style={{ 
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>
            </div>
            
            {/* Month navigation */}
            <div className="flex justify-between items-center mb-3">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevMonth();
                }}
                className="flex items-center px-2 py-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Prev
              </button>
              <h3 className="text-white text-sm font-medium">
                {getMonthName(viewDate)} {viewDate.getFullYear()}
              </h3>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleNextMonth();
                }}
                className="flex items-center px-2 py-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Next →
              </button>
            </div>
            
            {/* Horizontal scrollable calendar */}
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto pb-2 scrollbar-hidden"
              style={{ scrollBehavior: 'smooth' }}
            >
              {dates.map((date, index) => {
                const isDisabled = isDateDisabled(date);
                const isSelected = isDateSelected(date);
                const isToday = isDateToday(date);
                const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                
                return (
                  <div 
                    key={index}
                    className="flex-shrink-0"
                    ref={isToday ? todayRef : null}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        !isDisabled && handleDateClick(date);
                      }}
                      disabled={isDisabled}
                      className={`
                        w-14 h-16 mx-1 flex flex-col items-center justify-center rounded-lg
                        transition-all duration-200 border
                        ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-purple-600/40'}
                        ${isSelected 
                          ? 'bg-purple-500/80 text-white font-medium border-purple-400' 
                          : isCurrentMonth 
                            ? 'text-gray-300 hover:text-white border-gray-700/50' 
                            : 'text-gray-500 border-transparent'}
                        ${isToday && !isSelected ? 'border-purple-500/50 bg-purple-500/20' : ''}
                      `}
                      aria-label={isToday ? "Today" : undefined}
                    >
                      <div className="text-xs font-medium mb-1">
                        {getDayName(date)}
                      </div>
                      <div className={`text-base ${isSelected || isToday ? 'font-bold' : ''}`}>
                        {formatDay(date)}
                      </div>
                      {isToday && (
                        <div className="mt-1 w-1 h-1 rounded-full bg-purple-400"></div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* Done button - Styled to match theme */}
            <button
              className="mt-3 w-full py-1.5 bg-gradient-to-r from-purple-600/70 to-purple-500/70 hover:from-purple-600/90 hover:to-purple-500/90 text-white text-sm rounded transition-colors shadow-md font-medium"
              style={{ boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)' }}
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DateVialSelector({ selectedDate, onChange, minDate, maxDate }: DateVialSelectorProps) {
  // This component is no longer needed but keeping it to avoid errors
  return <div></div>;
}

interface FormData {
  name: string;
  ticker: string;
  description: string;
  image: File | null;
  totalSupply: string;
  tokenPrice: string;
  minPurchase: string;
  maxPurchase: string;
  presaleAmount: number;
  presalePercentage: number;
  endTime: string;
}

// Add animation keyframes to the component
const GlobalStyles = () => {
  return (
    <style jsx global>{`
      @keyframes bubble {
        0% { transform: translateY(0) scale(1); opacity: 0.7; }
        100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
      }
      
      @keyframes slideUp {
        0% { opacity: 0; transform: translateY(10px) scale(0.98); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      
      /* Hide scrollbar but keep functionality */
      .scrollbar-hidden {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      
      .scrollbar-hidden::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
      
      /* Hide number input spinners */
      input[type=number]::-webkit-inner-spin-button, 
      input[type=number]::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
        margin: 0; 
      }
      
      input[type=number] {
        -moz-appearance: textfield;
      }
      
      .perspective-500 {
        perspective: 500px;
      }
      
      .shadow-glow {
        box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
      }
      
      /* Custom styling for toast notifications */
      .themed-toast {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        border-radius: 8px !important;
        backdrop-filter: blur(8px);
      }
      
      .themed-toast [data-icon] {
        background-color: rgba(139, 92, 246, 0.2) !important;
        color: #a78bfa !important;
      }
      
      .themed-toast [data-close-button] {
        color: rgba(255, 255, 255, 0.5) !important;
      }
      
      .themed-toast [data-close-button]:hover {
        color: rgba(255, 255, 255, 0.8) !important;
      }
    `}</style>
  );
};

export default function TokenLaunchForm() {
  const { publicKey, signTransaction, sendTransaction, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [finalUri, setFinalUri] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showValidation, setShowValidation] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ticker: '',
    description: '',
    image: null,
    totalSupply: '1000000000',
    tokenPrice: '0.00001',
    presaleAmount: 42,
    minPurchase: '0.01',
    maxPurchase: '',
    presalePercentage: 50,
    endTime: '',
  });

  // Update form data when selected date changes - But only update if date is defined
  useEffect(() => {
    if (selectedDate) {
      // Format the date to YYYY-MM-DDThh:mm
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      setFormData(prev => ({ ...prev, endTime: formattedDate }));
    }
  }, [selectedDate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setFormData({ ...formData, image: file });
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        themedToast.error('Please upload an image file');
      }
    }
  }, [formData]);

  const uploadToPinata = async (file: File) => {
    try {
      const data = new FormData();
      data.set('file', file);
      
      const uploadResponse = await fetch('/api/pinata/upload', {
        method: 'POST',
        body: data,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to Pinata');
      }
      
      const uploadResult = await uploadResponse.json();
      return uploadResult.url;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw error;
    }
  };

  const uploadMetadataToPinata = async (metadata: object) => {
    try {
      const response = await fetch('/api/pinata/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload metadata to Pinata');
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error uploading metadata to Pinata:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    
    // Do validation here, not during date selection
    if (!connected || !publicKey) {
      themedToast.error('Please connect your wallet first');
      return;
    }

    if (!formData.image) {
      themedToast.error('Please upload an image');
      return;
    }
    
    if (!formData.endTime) {
      themedToast.error('Please select an end time');
      return;
    }
    
    // Check wallet network before proceeding
    try {
      // Try to get the latest blockhash to verify connection
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      console.log('Connected to network with blockhash:', blockhash);
      
      if (process.env.NEXT_PUBLIC_NETWORK === 'mainnet' || process.env.NEXT_PUBLIC_USE_MAINNET === 'true') {
        themedToast.info('Using mainnet network for transaction');
      } else {
        themedToast.info('Using devnet/testnet for transaction');
      }
    } catch (networkError) {
      console.error('Network connection error:', networkError);
      themedToast.error('Network connection error. Please check that your wallet is on the correct network.');
      return;
    }

    setIsLoading(true);
    try {
      // Upload image to Pinata
      const imageUrl = await uploadToPinata(formData.image);
      
      // Create metadata object
      const metadata = {
        name: formData.name,
        symbol: formData.ticker,
        description: formData.description,
        image: imageUrl,
        attributes: [
          {
            trait_type: "Total Supply",
            value: formData.totalSupply
          }
        ]
      };
      
      // Upload metadata to Pinata
      const metadataUrl = await uploadMetadataToPinata(metadata);
      
      // Save the metadata URL
      setFinalUri(metadataUrl);

      // Now create presale using the token
      const response = await fetch('/api/presale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          symbol: formData.ticker,
          uri: metadataUrl,
          imageURI: imageUrl,
          description: formData.description,
          totalSupply: parseInt(formData.totalSupply),
          presaleAmount: formData.presaleAmount * 1e9,
          // Initial token price: amount as u64 / (total_supply * presale_percentage as u64 / 100);
          tokenPrice: (formData.presaleAmount) / (parseInt(formData.totalSupply) * formData.presalePercentage / 100),
          minPurchase: parseFloat(formData.minPurchase),
          maxPurchase: parseFloat(formData.maxPurchase),
          presalePercentage: 100 - formData.presalePercentage - 20,
          endTime: Math.floor(selectedDate.getTime() / 1000),
          userAddress: publicKey.toString(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create token');
      }
      
      // Validate response before proceeding
      if (!data.tx) {
        throw new Error('No transaction data received from server');
      }
      
      // Sign and send transaction using wallet adapter
      const tx = data.tx;
      console.log('Received base64 tx:', tx.substring(0, 50) + '...');
      
      // Create a fresh transaction from the serialized data
      const buffer = Buffer.from(tx, 'base64');
      console.log('Buffer length:', buffer.length);
      
      // Deserialize with proper options
      const txData = Transaction.from(buffer);
      console.log('Transaction instructions count:', txData.instructions.length);
      
      // We don't need to set these again as they're already set on the server
      // but setting them again ensures we have the latest values
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      txData.recentBlockhash = blockhash;
      txData.feePayer = publicKey;
      
      // Ensure transaction is fully prepared before sending
      if (!txData.recentBlockhash) {
        console.error('Transaction missing recentBlockhash');
        throw new Error('Transaction not properly prepared: missing recentBlockhash');
      }
      
      if (!txData.feePayer) {
        console.error('Transaction missing feePayer');
        throw new Error('Transaction not properly prepared: missing feePayer');
      }
      
      console.log('Transaction data:', txData);
      console.log('Transaction ready to send with feePayer:', publicKey.toString());
      
      try {
        // Sign and send transaction using wallet adapter with skipPreflight option
        console.log('Sending transaction...');
        const signature = await sendTransaction(txData, connection, {
          skipPreflight: true,
          preflightCommitment: 'confirmed',
          maxRetries: 3
        });
        console.log('signature', signature);
        themedToast.success('Token created successfully!');
      } catch (txError: any) {
        console.error('Transaction error details:', txError);
        // Re-throw to be caught by the outer try-catch
        throw txError;
      }
    } catch (error: any) {
      console.error('Error creating token:', error);
      themedToast.error(error.message || 'Failed to create token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <GlobalStyles />
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-800/50 border-gray-700"
            required
          />
        </div>

        {/* Ticker Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Ticker</label>
          <Input
            type="text"
            value={formData.ticker}
            onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
            className="w-full bg-gray-800/50 border-gray-700"
            placeholder="$"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-800/50 border-gray-700"
            rows={4}
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Image</label>
          <div 
            className={`bg-gray-800/50 border-2 ${isDragging ? 'border-green-500 border-dashed' : 'border-gray-700'} rounded-lg p-6 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] cursor-pointer`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            {imagePreview ? (
              <div className="w-full flex flex-col items-center">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-48 max-w-full object-contain rounded-lg mb-4" 
                />
                <p className="text-sm text-gray-400">Click or drag to change image</p>
              </div>
            ) : (
              <>
                <Upload className="h-16 w-16 text-gray-500 mb-4" />
                <p className="text-gray-300 font-medium mb-2">Drag and drop your token image here</p>
                <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
                <Button
                  type="button"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Select Image
                </Button>
              </>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              required
            />
          </div>
        </div>

        {/* Token Details */}
        <Card className="p-4 bg-transparent border-gray-700">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Token Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Total Supply</label>
              <Input
                type="number"
                value={formData.totalSupply}
                onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min="0"
                required
              />
            </div>
          </div>
        </Card>

        {/* Presale Configuration */}
        <Card className="p-4 bg-transparent border-gray-700">
          <h3 className="text-lg font-medium text-gray-200 mb-6">Presale Configuration</h3>
          
          {/* Two column layout for vertical sliders with increased height */}
          <div className="grid grid-cols-2 gap-8 h-[280px] mb-6">
            {/* DEV Allocation Slider */}
            <CylinderSlider
              label="DEV Allocation"
              values={[0, 10, 20, 30, 40, 50]}
              currentValue={formData.presalePercentage}
              onChange={(value) => setFormData({ ...formData, presalePercentage: value })}
              unit="%"
              color="#f97316" // orange-500
            />
            
            {/* Presale Target Amount Slider */}
            <CylinderSlider
              label="Presale Target Amount"
              values={[42, 52, 62, 72, 82, 92, 102, 112, 122, 132, 142, 152, 162, 172, 182, 192, 202, 212, 222, 232, 242, 252, 262, 272, 282, 292, 302, 312, 322, 332, 342, 352, 362, 372, 382, 392, 402, 410, 420]}
              currentValue={formData.presaleAmount}
              onChange={(value) => setFormData({ ...formData, presaleAmount: value })}
              unit=" sol"
              color="#8b5cf6" // purple-500
            />
          </div>
          
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Max Purchase (SOL)</label>
              <Input
                type="number"
                value={formData.maxPurchase}
                onChange={(e) => setFormData({ ...formData, maxPurchase: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min="0"
                required={showValidation}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">End Time</label>
              <ThemeCalendar
                selectedDate={selectedDate}
                onChange={setSelectedDate}
                minDate={new Date()} // Minimum date is today
              />
              {/* Hidden input for form data, but not required until submit */}
              <input
                type="hidden"
                value={formData.endTime}
                name="endTime"
                required={showValidation}
              />
              {showValidation && !formData.endTime && (
                <p className="mt-1 text-xs text-red-500">Please select an end time</p>
              )}
            </div>
          </div>
        </Card>

        {/* Launch Button */}
        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg"
          disabled={isLoading || !connected}
        >
          {!connected 
            ? 'Connect Your Wallet to Continue'
            : isLoading 
              ? 'Creating Token...' 
              : 'Launch Token'
          }
        </Button>
      </form>
    </div>
  );
} 