'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from '@/firebase';
import { Box, Modal, TextField, Typography, Stack, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editItem, setEditItem] = useState(null);

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, 'pantry'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
      console.log('Inventory updated:', inventoryList);
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }
      await updateInventory();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }
      await updateInventory();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateItem = async (oldName, newName, newQuantity) => {
    try {
      const oldDocRef = doc(collection(firestore, 'pantry'), oldName);
      const newDocRef = doc(collection(firestore, 'pantry'), newName);

      // Check if the new item name already exists
      const newDocSnap = await getDoc(newDocRef);

      if (newDocSnap.exists()) {
        // If the new name already exists, just update the quantity
        await setDoc(newDocRef, { quantity: newQuantity }, { merge: true });
      } else {
        // If the new name does not exist, create a new document
        await setDoc(newDocRef, { quantity: newQuantity });
      }

      // Delete the old item if the name has changed
      if (oldName !== newName) {
        await deleteDoc(oldDocRef);
      }

      await updateInventory();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = (item = null) => {
    if (item) {
      setItemName(item.name);
      setEditItem({ ...item });
    } else {
      setItemName('');
      setEditItem(null);
    }
    setOpen(true);
  };
  
  const handleClose = () => {
    setItemName('');
    setEditItem(null);
    setOpen(false);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      justifyContent="center" 
      alignItems="center"
      flexDirection="column"
      gap={2}
      bgcolor="#fce4ec"
      p={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box
          position='absolute'
          top="50%"
          left="50%"
          width={400}
          bgcolor="#ffffff"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
            borderRadius: '16px',
          }}
        >
          <Typography variant="h6" fontFamily="Apple Color Emoji" color="#ec407a">
            {editItem ? 'Update Item' : 'Add Item'}
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant='outlined'
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ec407a',
                  },
                  '&:hover fieldset': {
                    borderColor: '#d81b60',
                  },
                },
              }}
            />
            <Button 
              variant="contained" 
              color="error"
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
              onClick={() => {
                if (editItem) {
                  if (itemName.trim() !== '' && !isNaN(parseInt(editItem.quantity))) {
                    updateItem(editItem.name, itemName, parseInt(editItem.quantity));
                  }
                } else {
                  if (itemName.trim() !== '') {
                    addItem(itemName);
                  }
                }
                handleClose();
              }}
            >
              {editItem ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button 
        variant="contained"
        color="error"
        onClick={() => handleOpen()}
        sx={{
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 'bold',
        }}
      >
        Add New Item
      </Button>
      <Box border='1px solid #ec407a' borderRadius='12px' bgcolor="#ffffff" p={2} width='800px'>
        <Box
          height='100px'
          bgcolor="#f48fb1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius='12px'
        >
          <Typography variant="h2" color="#ffffff" fontFamily="Apple Color Emoji">
            Inventory Items
          </Typography>
        </Box>
        <Box p={2}>
          <TextField
            variant='outlined'
            fullWidth
            placeholder="Search items"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              marginBottom: '16px',
              borderRadius: '12px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#ec407a',
                },
                '&:hover fieldset': {
                  borderColor: '#d81b60',
                },
              },
            }}
          />
          <Stack width='100%' height="300px" spacing={2} overflow="auto">
            {filteredInventory.map(({ name, quantity }) => (
              <Box key={name} width="100%" minHeight="150px" display="flex"
                alignItems="center" justifyContent="space-between" bgcolor="#ffffff" padding={3} borderRadius='12px'
                boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
              >
                <Typography 
                  variant="h4" 
                  color="#ec407a" 
                  textAlign="center"
                  fontFamily="Apple Color Emoji"
                > 
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography 
                  variant="h4" 
                  color="#ec407a" 
                  textAlign="center"
                  fontFamily="Apple Color Emoji"
                > 
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => handleOpen({ name, quantity })}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    Update
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => removeItem(name)}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

