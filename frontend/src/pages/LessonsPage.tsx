import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { lessonsAPI } from '../services/api';
import { Lesson, LessonFilters } from '../types';
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  User, 
  Crown,
  BookOpen,
  X
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const LessonsPage: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<LessonFilters>({
    page: 1,
    limit: 12,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showPremiumOnly, setShowPremiumOnly] = useState<boolean | undefined>(undefined);

  const categories = [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Data Science',
    'Language',
    'Music',
    'Photography'
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['lessons', filters, searchTerm],
    queryFn: () => {
      if (searchTerm) {
        return lessonsAPI.search(searchTerm, {
          category: selectedCategory || undefined,
          isPremium: showPremiumOnly,
          page: filters.page,
          limit: filters.limit,
        });
      }
      return lessonsAPI.getAll({
        ...filters,
        category: selectedCategory || undefined,
        isPremium: showPremiumOnly,
      });
    },
    keepPreviousData: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handlePremiumFilter = () => {
    if (showPremiumOnly === undefined) {
      setShowPremiumOnly(true);
    } else if (showPremiumOnly === true) {
      setShowPremiumOnly(false);
    } else {
      setShowPremiumOnly(undefined);
    }
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowPremiumOnly(undefined);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-medium mb-2">
          Failed to load lessons
        </div>
        <p className="text-gray-600">
          Please try again later or contact support if the problem persists.
        </p>
      </div>
    );
  }

  const lessons = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 0;
  const currentPage = filters.page || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Lessons</h1>
          <p className="mt-2 text-gray-600">
            Discover and learn from our comprehensive collection of lessons
          </p>
        </div>
        {user && (
          <Link
            to="/subscription"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Premium Filter */}
          <button
            onClick={handlePremiumFilter}
            className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 ${
              showPremiumOnly === true
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                : showPremiumOnly === false
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Crown className="w-3 h-3" />
            {showPremiumOnly === true
              ? 'Premium Only'
              : showPremiumOnly === false
              ? 'Free Only'
              : 'All Content'}
          </button>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory || showPremiumOnly !== undefined) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {data?.data && (
        <div className="text-sm text-gray-600">
          Showing {lessons.length} of {data.data.total} lessons
        </div>
      )}

      {/* Lessons Grid */}
      {lessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lessons.map((lesson: Lesson) => (
            <Link
              key={lesson.id}
              to={`/lessons/${lesson.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-200">
                {lesson.thumbnailUrl ? (
                  <img
                    src={lesson.thumbnailUrl}
                    alt={lesson.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {lesson.isPremium && (
                  <div className="absolute top-2 right-2">
                    <Crown className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center">
                  <Play className="w-3 h-3 mr-1" />
                  {formatDuration(lesson.duration)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {lesson.category}
                  </span>
                  {lesson.isPremium ? (
                    <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                      Free
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {lesson.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {lesson.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {lesson.author}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(lesson.duration)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No lessons found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, currentPage - 1) }))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setFilters(prev => ({ ...prev, page }))}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, currentPage + 1) }))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default LessonsPage;
