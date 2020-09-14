import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      await api.get('/foods').then(response => {
        setFoods(response.data);
      });
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      await api
        .post('/foods', {
          ...food,
          available: true,
        })
        .then(response => setFoods([...foods, response.data]));
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    let updatedFoods: IFoodPlate[] = [] as IFoodPlate[];
    await api
      .post(`/foods/${editingFood.id}`, {
        food,
        available: editingFood.available,
      })
      .then(response => {
        updatedFoods = foods.map((foodToSave: IFoodPlate):
          | IFoodPlate
          | undefined => {
          if (foodToSave.id === editingFood.id) {
            return {
              id: editingFood.id,
              name: JSON.stringify(response.data.name),
              image: JSON.stringify(response.data.image),
              price: JSON.stringify(response.data.price),
              description: JSON.stringify(response.data.description),
              available: editingFood.available,
            };
          }
          return undefined;
        });

        if (updatedFoods !== undefined) {
          setFoods(updatedFoods);
        }
      });
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);
    const updatedFoods: IFoodPlate[] = [] as IFoodPlate[];
    foods.map((food: IFoodPlate): undefined => {
      if (food.id !== id) {
        updatedFoods.push(food);
      }
      return undefined;
    });
    setFoods(updatedFoods);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
