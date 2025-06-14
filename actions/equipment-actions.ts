"use server";

import { createClient } from "@/lib/supabase/server";
import { ApiAction } from "@/rails/types";
import { withInternalActionTracking } from "@/lib/action-wrapper";
import {  EquipmentFormType } from "@/rails/model/EquipmentModel";

export async function createEquipment(data: EquipmentFormType): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    // Get the current user to ensure they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { success: false, error: "User not authenticated" };
    }

    console.log(`Creating equipment with data:`, data);

    // Insert the equipment
    const { data: result, error } = await supabase
      .from('equipment')
      .insert({
        serial_id: data.serial_id,
        type: data.type,
        model: data.model,
        size: data.size,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating equipment:", error);
      
      // Handle duplicate serial_id error
      if (error.code === '23505') {
        return { success: false, error: "Equipment with this serial ID already exists" };
      }
      
      return { success: false, error: error.message };
    }

    console.log("Equipment created successfully:", result);
    return { success: true, data: result };
  });
}

export async function updateEquipment(id: string, data: Partial<EquipmentFormType>): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    // Get the current user to ensure they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { success: false, error: "User not authenticated" };
    }

    console.log(`Updating equipment ${id} with data:`, data);

    // Update the equipment
    const { data: result, error } = await supabase
      .from('equipment')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating equipment:", error);
      
      // Handle duplicate serial_id error
      if (error.code === '23505') {
        return { success: false, error: "Equipment with this serial ID already exists" };
      }
      
      return { success: false, error: error.message };
    }

    console.log("Equipment updated successfully:", result);
    return { success: true, data: result };
  });
}

export async function deleteEquipment(id: string): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    // Get the current user to ensure they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { success: false, error: "User not authenticated" };
    }

    console.log(`Deleting equipment ${id}`);

    // Delete the equipment
    const { data: result, error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error deleting equipment:", error);
      return { success: false, error: error.message };
    }

    console.log("Equipment deleted successfully:", result);
    return { success: true, data: result };
  });
}

export async function getEquipmentById(id: string): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    // Get the current user to ensure they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { success: false, error: "User not authenticated" };
    }

    console.log(`Getting equipment by ID: ${id}`);

    // Get the equipment
    const { data: result, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error getting equipment:", error);
      return { success: false, error: error.message };
    }

    console.log("Equipment retrieved successfully:", result);
    return { success: true, data: result };
  });
}

export async function getEquipmentBySerialId(serialId: string): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    // Get the current user to ensure they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { success: false, error: "User not authenticated" };
    }

    console.log(`Getting equipment by serial ID: ${serialId}`);

    // Get the equipment
    const { data: result, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('serial_id', serialId)
      .single();

    if (error) {
      console.error("Error getting equipment:", error);
      return { success: false, error: error.message };
    }

    console.log("Equipment retrieved successfully:", result);
    return { success: true, data: result };
  });
}

export async function getAllEquipment(): Promise<ApiAction> {
  return withInternalActionTracking(async () => {
    const supabase = await createClient();
    
    // Get the current user to ensure they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { success: false, error: "User not authenticated" };
    }

    console.log("Getting all equipment");

    // Get all equipment
    const { data: result, error } = await supabase
      .from('equipment')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error getting equipment:", error);
      return { success: false, error: error.message };
    }

    console.log("Equipment retrieved successfully:", result);
    return { success: true, data: result };
  });
}
