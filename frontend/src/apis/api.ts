import axios from "axios";
import { UUID } from "../types/User";

// Define the base URL for your API
const API_URL = "http://54.159.174.236:8000/api/";

// Define the type for categories and tasks
type Category = {
  id: UUID;
  name: string;
};

type Task = {
  id: UUID;
  name: string;
  description?: string;
  completed: boolean;
  categories?: Category[];
  date: string; // Use ISO date string format
  deadline?: string; // Use ISO date string format
  created_at?: string;
  updated_at?: string;
};

// Fetch all tasks from the API
export const fetchTasks = async () => {
  try {
    const response = await axios.get<Task[]>(`${API_URL}tasks/`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Create a new task
export const createTask = async (task: {
  name: string;
  description?: string;
  completed: boolean;
  categories?: Category[];
  date: string; // Use ISO date string format
  deadline?: string; // Use ISO date string format
}): Promise<Task | undefined> => {
  try {
    const response = await axios.post(`${API_URL}tasks/`, task);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (
  id: UUID,
  task: {
    name: string;
    description?: string;
    completed: boolean;
    categories?: Category[];
    date: string; // Use ISO date string format
    deadline?: string; // Use ISO date string format
  }
) => {
  try {
    const response = await axios.put<Task>(`${API_URL}tasks/${id}/`, task);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (id: UUID) => {
  try {
    const response = await axios.delete(`${API_URL}tasks/${id}/`);
    console.log("Task deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Fetch all categories
export const fetchCategories = async () => {
  try {
    const response = await axios.get<Category[]>(`${API_URL}categories/`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (category: { name: string }) => {
  try {
    const response = await axios.post<Category>(
      `${API_URL}categories/`,
      category
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Update an existing category
export const updateCategory = async (
  id: string,
  category: { name: string }
) => {
  try {
    const response = await axios.put<Category>(
      `${API_URL}categories/${id}/`,
      category
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}categories/${id}/`);
    console.log("Category deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
