import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface FormData {
  email: string;
  password: string;
  username: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
}

export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    username: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    if (!formData.username) {
      newErrors.username = 'ユーザー名を入力してください';
    } else if (formData.username.length < 2) {
      newErrors.username = 'ユーザー名は2文字以上で入力してください';
    } else if (formData.username.length > 50) {
      newErrors.username = 'ユーザー名は50文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: formData.username,
        });

        if (profileError && !profileError.message.includes('duplicate')) {
          console.error('Profile creation error:', profileError);
        }
      }

      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already registered')) {
          setApiError('このメールアドレスは既に登録されています');
        } else {
          setApiError(error.message);
        }
      } else {
        setApiError('登録中にエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-8 text-center text-2xl font-bold text-gray-800">
        新規登録
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            ユーザー名
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
              errors.username
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="表示名を入力"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
              errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            パスワード
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
              errors.password
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="6文字以上"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? '登録中...' : '登録する'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        すでにアカウントをお持ちの方は
        <Link to="/login" className="ml-1 text-blue-600 hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  );
};
