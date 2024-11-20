'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, RefreshCw, Loader2, Plus, Minus, AlertTriangle, Key, Lock } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { jsPDF } from 'jspdf'
import pptxgen from 'pptxgenjs'
import JSZip from 'jszip/dist/jszip.min.js'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth'

interface Word {
  word: string
  clue: string
  direction?: 'across' | 'down'
  row?: number
  col?: number
}

interface FileSize {
  name: string
  width: number
  height: number
}

interface License {
  key: string
  type: 'one-month' | 'lifetime'
  expirationDate?: Date
  isActive: boolean
}

const fileSizes: FileSize[] = [
  { name: '4 x 6"', width: 101.6, height: 152.4 },
  { name: '4 x 7"', width: 101.6, height: 177.8 },
  { name: '4.25 x 7"', width: 107.95, height: 177.8 },
  { name: '4.37 x 7"', width: 111, height: 177.8 },
  { name: '4.72 x 7.48"', width: 119.9, height: 190 },
  { name: '5 x 7"', width: 127, height: 177.8 },
  { name: '5 x 8"', width: 127, height: 203.2 },
  { name: '5.06 x 7.81"', width: 128.5, height: 198.4 },
  { name: '5.5 x 8.25"', width: 139.7, height: 209.55 },
  { name: '5.5 x 8.5"', width: 139.7, height: 215.9 },
  { name: '5.83 x 8.27"', width: 148.1, height: 210.1 },
  { name: '6 x 9"', width: 152.4, height: 228.6 },
  { name: '6.14 x 9.21"', width: 156, height: 234 },
  { name: '6.5 x 6.5"', width: 165.1, height: 165.1 },
  { name: '6.625 x 10.25"', width: 168.3, height: 260.35 },
  { name: '6.69 x 9.61"', width: 169.9, height: 244.1 },
  { name: '7 x 10"', width: 177.8, height: 254 },
  { name: '7.44 x 9.69"', width: 189, height: 246.1 },
  { name: '7.5 x 9.25"', width: 190.5, height: 235 },
  { name: '8 x 8"', width: 203.2, height: 203.2 },
  { name: '8 x 10"', width: 203.2, height: 254 },
  { name: '8 x 10.88"', width: 203.2, height: 276.4 },
  { name: '8.25 x 8.25"', width: 209.55, height: 209.55 },
  { name: '8.25 x 10.75"', width: 209.55, height: 273.05 },
  { name: '8.25 x 11"', width: 209.55, height: 279.4 },
  { name: '8.268 x 11.693"', width: 210, height: 297 },
  { name: '8.5 x 8.5"', width: 215.9, height: 215.9 },
  { name: '8.5 x 11"', width: 215.9, height: 279.4 },
]

const RESOLUTION_SCALE = 8 // Increased for better quality

// Example list of valid license keys
const validLicenseKeys = [
  'MONTH-A1B2C-3D4E5',
  'MONTH-F6G7H-8I9J0',
  'MONTH-K1L2M-3N4O5',
  'MONTH-P6Q7R-8S9T0',
  'LIFE-Z9Y8X-7W6V5',
]

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDl4bFaVJDiXELyl78cKNzo3vUDaHrM6ms",
  authDomain: "crossword---copie.firebaseapp.com",
  projectId: "crossword---copie",
  storageBucket: "crossword---copie.firebasestorage.app",
  messagingSenderId: "866214959651",
  appId: "1:866214959651:web:5c0837a2186b2862c2af96",
  measurementId: "G-8TE93CTPJ9"
};
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Move defaultWordList outside of the component
const defaultWordList: Word[] = [
  { word: "COMPASSION", clue: "Sympathy for others' suffering." },
  { word: "EMPATHY", clue: "The ability to understand and share the feelings of others." },
  { word: "CONNECTION", clue: "A relationship or bond with someone." },
  { word: "FRIENDSHIP", clue: "A mutual affection between people." },
  { word: "SUPPORT", clue: "To provide assistance to someone." },
  { word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal." },
  { word: "COLLECTIVE", clue: "A group acting as a whole." },
  { word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes." },
  { word: "COLLABORATION", clue: "The act of working together towards a common goal." },
  { word: "CHANGE", clue: "The act of making something different." },
  { word: "PROGRESS", clue: "Forward movement towards a goal." },
  { word: "ACHIEVEMENT", clue: "The act of achieving something." },
  { word: "SUCCESS", clue: "The accomplishment of an aim or purpose." },
  { word: "HAPPINESS", clue: "The state of being happy." },
  { word: "CONTENTMENT", clue: "A state of happiness and satisfaction." },
  { word: "JOY", clue: "A feeling of great pleasure or happiness." },
  { word: "LOVE", clue: "An intense feeling of deep affection." },
  { word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness." },
  { word: "GENEROSITY", clue: "The quality of being kind and giving." },
{ word: "COMPASSION", clue: "Sympathy for others' suffering.", direction: "across", row: 544, col: 2 },
{ word: "EMPATHY", clue: "The ability to understand and share the feelings of others.", direction: "down", row: 541, col: 5 },
{ word: "CONNECTION", clue: "A relationship or bond with someone.", direction: "across", row: 545, col: 1 },
{ word: "FRIENDSHIP", clue: "A mutual affection between people.", direction: "down", row: 546, col: 2 },
{ word: "SUPPORT", clue: "To provide assistance to someone.", direction: "down", row: 543, col: 5 },
{ word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal.", direction: "across", row: 547, col: 1 },
{ word: "COLLECTIVE", clue: "A group acting as a whole.", direction: "down", row: 544, col: 6 },
{ word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes.", direction: "across", row: 548, col: 2 },
{ word: "COLLABORATION", clue: "The act of working together towards a common goal.", direction: "down", row: 545, col: 5 },
{ word: "CHANGE", clue: "The act of making something different.", direction: "across", row: 549, col: 1 },
{ word: "PROGRESS", clue: "Forward movement towards a goal.", direction: "down", row: 546, col: 6 },
{ word: "ACHIEVEMENT", clue: "The act of achieving something.", direction: "across", row: 550, col: 2 },
{ word: "SUCCESS", clue: "The accomplishment of an aim or purpose.", direction: "down", row: 547, col: 5 },
{ word: "HAPPINESS", clue: "The state of being happy.", direction: "across", row: 551, col: 1 },
{ word: "CONTENTMENT", clue: "A state of happiness and satisfaction.", direction: "down", row: 548, col: 6 },
{ word: "JOY", clue: "A feeling of great pleasure or happiness.", direction: "across", row: 552, col: 2 },
{ word: "LOVE", clue: "An intense feeling of deep affection.", direction: "down", row: 549, col: 5 },
{ word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness.", direction: "across", row: 553, col: 1 },
{ word: "GENEROSITY", clue: "The quality of being kind and giving.", direction: "down", row: 550, col: 6 },
{ word: "KINDNESS", clue: "The quality of being friendly and considerate.", direction: "across", row: 554, col: 2 },
{ word: "COMPASSION", clue: "Sympathy for others' suffering.", direction: "down", row: 551, col: 5 },
{ word: "EMPATHY", clue: "The ability to understand and share the feelings of others.", direction: "across", row: 555, col: 1 },
{ word: "CONNECTION", clue: "A relationship or bond with someone.", direction: "down", row: 552, col: 6 },
{ word: "FRIENDSHIP", clue: "A mutual affection between people.", direction: "across", row: 556, col: 2 },
{ word: "SUPPORT", clue: "To provide assistance to someone.", direction: "down", row: 553, col: 5 },
{ word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal.", direction: "across", row: 557, col: 1 },
{ word: "COLLECTIVE", clue: "A group acting as a whole.", direction: "down", row: 554, col: 6 },
{ word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes.", direction: "across", row: 558, col: 2 },
{ word: "COLLABORATION", clue: "The act of working together towards a common goal.", direction: "down", row: 555, col: 5 },
{ word: "CHANGE", clue: "The act of making something different.", direction: "across", row: 559, col: 1 },
{ word: "PROGRESS", clue: "Forward movement towards a goal.", direction: "down", row: 556, col: 6 },
{ word: "ACHIEVEMENT", clue: "The act of achieving something.", direction: "across", row: 560, col: 2 },
{ word: "SUCCESS", clue: "The accomplishment of an aim or purpose.", direction: "down", row: 557, col: 5 },
{ word: "HAPPINESS", clue: "The state of being happy.", direction: "across", row: 561, col: 1 },
{ word: "CONTENTMENT", clue: "A state of happiness and satisfaction.", direction: "down", row: 558, col: 6 },
{ word: "JOY", clue: "A feeling of great pleasure or happiness.", direction: "across", row: 562, col: 2 },
{ word: "LOVE", clue: "An intense feeling of deep affection.", direction: "down", row: 559, col: 5 },
{ word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness.", direction: "across", row: 563, col: 1 },
{ word: "GENEROSITY", clue: "The quality of being kind and giving.", direction: "down", row: 560, col: 6 },
{ word: "KINDNESS", clue: "The quality of being friendly and considerate.", direction: "across", row: 564, col: 2 },
{ word: "COMPASSION", clue: "Sympathy for others' suffering.", direction: "down", row: 561, col: 5 },
{ word: "EMPATHY", clue: "The ability to understand and share the feelings of others.", direction: "across", row: 565, col: 1 },
{ word: "CONNECTION", clue: "A relationship or bond with someone.", direction: "down", row: 562, col: 6 },
{ word: "FRIENDSHIP", clue: "A mutual affection between people.", direction: "across", row: 566, col: 2 },
{ word: "SUPPORT", clue: "To provide assistance to someone.", direction: "down", row: 563, col: 5 },
{ word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal.", direction: "across", row: 567, col: 1 },
{ word: "COLLECTIVE", clue: "A group acting as a whole.", direction: "down", row: 564, col: 6 },
{ word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes.", direction: "across", row: 568, col: 2 },
{ word: "COLLABORATION", clue: "The act of working together towards a common goal.", direction: "down", row: 565, col: 5 },
{ word: "CHANGE", clue: "The act of making something different.", direction: "across", row: 569, col: 1 },
{ word: "PROGRESS", clue: "Forward movement towards a goal.", direction: "down", row: 566, col: 6 },
{ word: "ACHIEVEMENT", clue: "The act of achieving something.", direction: "across", row: 570, col: 2 },
{ word: "SUCCESS", clue: "The accomplishment of an aim or purpose.", direction: "down", row: 567, col: 5 },
{ word: "HAPPINESS", clue: "The state of being happy.", direction: "across", row: 571, col: 1 },
{ word: "CONTENTMENT", clue: "A state of happiness and satisfaction.", direction: "down", row: 568, col: 6 },
{ word: "JOY", clue: "A feeling of great pleasure or happiness.", direction: "across", row: 572, col: 2 },
{ word: "LOVE", clue: "An intense feeling of deep affection.", direction: "down", row: 569, col: 5 },
{ word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness.", direction: "across", row: 573, col: 1 },
{ word: "GENEROSITY", clue: "The quality of being kind and giving.", direction: "down", row: 570, col: 6 },
{ word: "KINDNESS", clue: "The quality of being friendly and considerate.", direction: "across", row: 574, col: 2 },
{ word: "COMPASSION", clue: "Sympathy for others' suffering.", direction: "down", row: 571, col: 5 },
{ word: "EMPATHY", clue: "The ability to understand and share the feelings of others.", direction: "across", row: 575, col: 1 },
{ word: "CONNECTION", clue: "A relationship or bond with someone.", direction: "down", row: 572, col: 6 },
{ word: "FRIENDSHIP", clue: "A mutual affection between people.", direction: "across", row: 576, col: 2 },
{ word: "SUPPORT", clue: "To provide assistance to someone.", direction: "down", row: 573, col: 5 },
{ word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal.", direction: "across", row: 577, col: 1 },
{ word: "COLLECTIVE", clue: "A group acting as a whole.", direction: "down", row: 574, col: 6 },
{ word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes.", direction: "across", row: 578, col: 2 },
{ word: "COLLABORATION", clue: "The act of working together towards a common goal.", direction: "down", row: 575, col: 5 },
{ word: "CHANGE", clue: "The act of making something different.", direction: "across", row: 579, col: 1 },
{ word: "PROGRESS", clue: "Forward movement towards a goal.", direction: "down", row: 576, col: 6 },
{ word: "ACHIEVEMENT", clue: "The act of achieving something.", direction: "across", row: 580, col: 2 },
{ word: "SUCCESS", clue: "The accomplishment of an aim or purpose.", direction: "down", row: 577, col: 5 },
{ word: "HAPPINESS", clue: "The state of being happy.", direction: "across", row: 581, col: 1 },
{ word: "CONTENTMENT", clue: "A state of happiness and satisfaction.", direction: "down", row: 578, col: 6 },
{ word: "JOY", clue: "A feeling of great pleasure or happiness.", direction: "across", row: 582, col: 2 },
{ word: "LOVE", clue: "An intense feeling of deep affection.", direction: "down", row: 579, col: 5 },
{ word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness.", direction: "across", row: 583, col: 1 },
{ word: "GENEROSITY", clue: "The quality of being kind and giving.", direction: "down", row: 580, col: 6 },
{ word: "KINDNESS", clue: "The quality of being friendly and considerate.", direction: "across", row: 584, col: 2 },
{ word: "COMPASSION", clue: "Sympathy for others' suffering.", direction: "down", row: 581, col: 5 },
{ word: "EMPATHY", clue: "The ability to understand and share the feelings of others.", direction: "across", row: 585, col: 1 },
{ word: "CONNECTION", clue: "A relationship or bond with someone.", direction: "down", row: 582, col: 6 },
{ word: "FRIENDSHIP", clue: "A mutual affection between people.", direction: "across", row: 586, col: 2 },
{ word: "SUPPORT", clue: "To provide assistance to someone.", direction: "down", row: 583, col: 5 },
{ word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal.", direction: "across", row: 587, col: 1 },
{ word: "COLLECTIVE", clue: "A group acting as a whole.", direction: "down", row: 584, col: 6 },
{ word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes.", direction: "across", row: 588, col: 2 },
{ word: "COLLABORATION", clue: "The act of working together towards a common goal.", direction: "down", row: 585, col: 5 },
{ word: "CHANGE", clue: "The act of making something different.", direction: "across", row: 589, col: 1 },
{ word: "PROGRESS", clue: "Forward movement towards a goal.", direction: "down", row: 586, col: 6 },
{ word: "ACHIEVEMENT", clue: "The act of achieving something.", direction: "across", row: 590, col: 2 },
{ word: "SUCCESS", clue: "The accomplishment of an aim or purpose.", direction: "down", row: 587, col: 5 },
{ word: "HAPPINESS", clue: "The state of being happy.", direction: "across", row: 591, col: 1 },
{ word: "CONTENTMENT", clue: "A state of happiness and satisfaction.", direction: "down", row: 588, col: 6 },
{ word: "JOY", clue: "A feeling of great pleasure or happiness.", direction: "across", row: 592, col: 2 },
{ word: "LOVE", clue: "An intense feeling of deep affection.", direction: "down", row: 589, col: 5 },
{ word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness.", direction: "across", row: 593, col: 1 },
{ word: "GENEROSITY", clue: "The quality of being kind and giving.", direction: "down", row: 590, col: 6 },
{ word: "KINDNESS", clue: "The quality of being friendly and considerate.", direction: "across", row: 594, col: 2 },
{ word: "COMPASSION", clue: "Sympathy for others' suffering.", direction: "down", row: 591, col: 5 },
{ word: "EMPATHY", clue: "The ability to understand and share the feelings of others.", direction: "across", row: 595, col: 1 },
{ word: "CONNECTION", clue: "A relationship or bond with someone.", direction: "down", row: 592, col: 6 },
{ word: "FRIENDSHIP", clue: "A mutual affection between people.", direction: "across", row: 596, col: 2 },
{ word: "SUPPORT", clue: "To provide assistance to someone.", direction: "down", row: 593, col: 5 },
{ word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal.", direction: "across", row: 597, col: 1 },
{ word: "COLLECTIVE", clue: "A group acting as a whole.", direction: "down", row: 594, col: 6 },
{ word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes.", direction: "across", row: 598, col: 2 },
{ word: "COLLABORATION", clue: "The act of working together towards a common goal.", direction: "down", row: 595, col: 5 },
{ word: "CHANGE", clue: "The act of making something different.", direction: "across", row: 599, col: 1 },
{ word: "PROGRESS", clue: "Forward movement towards a goal.", direction: "down", row: 596, col: 6 },
{ word: "ACHIEVEMENT", clue: "The act of achieving something.", direction: "across", row: 600, col: 2 },
{ word: "SUCCESS", clue: "The accomplishment of an aim or purpose.", direction: "down", row: 597, col: 5 },
{ word: "HAPPINESS", clue: "The state of being happy.", direction: "across", row: 601, col: 1 },
{ word: "CONTENTMENT", clue: "A state of happiness and satisfaction.", direction: "down", row: 598, col: 6 },
{ word: "JOY", clue: "A feeling of great pleasure or happiness.", direction: "across", row: 602, col: 2 },
{ word: "LOVE", clue: "An intense feeling of deep affection.", direction: "down", row: 599, col: 5 },
{ word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness.", direction: "across", row: 603, col: 1 },
{ word: "GENEROSITY", clue: "The quality of being kind and giving.", direction: "down", row: 600, col: 6 },
{ word: "KINDNESS", clue: "The quality of being friendly and considerate.", direction: "across", row: 604, col: 2 },
{ word: "COMPASSION", clue: "Sympathy for others' suffering.", direction: "down", row: 601, col: 5 },
{ word: "EMPATHY", clue: "The ability to understand and share the feelings of others.", direction: "across", row: 605, col: 1 },
{ word: "CONNECTION", clue: "A relationship or bond with someone.", direction: "down", row: 602, col: 6 },
{ word: "FRIENDSHIP", clue: "A mutual affection between people.", direction: "across", row: 606, col: 2 },
{ word: "SUPPORT", clue: "To provide assistance to someone.", direction: "down", row: 603, col: 5 },
{ word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal.", direction: "across", row: 607, col: 1 },
{ word: "COLLECTIVE", clue: "A group acting as a whole.", direction: "down", row: 604, col: 6 },
{ word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes.", direction: "across", row: 608, col: 2 },
{ word: "COLLABORATION", clue: "The act of working together towards a common goal.", direction: "down", row: 605, col: 5 },
{ word: "CHANGE", clue: "The act of making something different.", direction: "across", row: 609, col: 1 },
{ word: "PROGRESS", clue: "Forward movement towards a goal.", direction: "down", row: 606, col: 6 },
{ word: "ACHIEVEMENT", clue: "The act of achieving something.", direction: "across", row: 610, col: 2 },
{ word: "SUCCESS", clue: "The accomplishment of an aim or purpose.", direction: "down", row: 607, col: 5 },
{ word: "HAPPINESS", clue: "The state of being happy.", direction: "across", row: 611, col: 1 },
{ word: "CONTENTMENT", clue: "A state of happiness and satisfaction.", direction: "down", row: 608, col: 6 },
{ word: "JOY", clue: "A feeling of great pleasure or happiness.", direction: "across", row: 612, col: 2 },
{ word: "LOVE", clue: "An intense feeling of deep affection.", direction: "down", row: 609, col: 5 },
{ word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness.", direction: "across", row: 613, col: 1 },
{ word: "GENEROSITY", clue: "The quality of being kind and giving.", direction: "down", row: 610, col: 6 },
{ word: "KINDNESS", clue: "The quality of being friendly and considerate.", direction: "across", row: 614, col: 2 },
{ word: "COMPASSION", clue: "Sympathy for others' suffering.", direction: "down", row: 611, col: 5 },
{ word: "EMPATHY", clue: "The ability to understand and share the feelings of others.", direction: "across", row: 615, col: 1 },
{ word: "CONNECTION", clue: "A relationship or bond with someone.", direction: "down", row: 612, col: 6 },
{ word: "FRIENDSHIP", clue: "A mutual affection between people.", direction: "across", row: 616, col: 2 },
{ word: "SUPPORT", clue: "To provide assistance to someone.", direction: "down", row: 613, col: 5 },
{ word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal.", direction: "across", row: 617, col: 1 },
{ word: "COLLECTIVE", clue: "A group acting as a whole.", direction: "down", row: 614, col: 6 },
{ word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes.", direction: "across", row: 618, col: 2 },
{ word: "COLLABORATION", clue: "The act of working together towards a common goal.", direction: "down", row: 615, col: 5 },
{ word: "CHANGE", clue: "The act of making something different.", direction: "across", row: 619, col: 1 },
{ word: "PROGRESS", clue: "Forward movement towards a goal.", direction: "down", row: 616, col: 6 },
{ word: "ACHIEVEMENT", clue: "The act of achieving something.", direction: "across", row: 620, col: 2 },
{ word: "SUCCESS", clue: "The accomplishment of an aim or purpose.", direction: "down", row: 617, col: 5 },
{ word: "HAPPINESS", clue: "The state of being happy.", direction: "across", row: 621, col: 1 },
{ word: "CONTENTMENT", clue: "A state of happiness and satisfaction.", direction: "down", row: 618, col: 6 },
{ word: "JOY", clue: "A feeling of great pleasure or happiness.", direction: "across", row: 622, col: 2 },
{ word: "LOVE", clue: "An intense feeling of deep affection.", direction: "down", row: 619, col: 5 },
{ word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness.", direction: "across", row: 623, col: 1 },
{ word: "GENEROSITY", clue: "The quality of being kind and giving.", direction: "down", row: 620, col: 6 },
{ word: "KINDNESS", clue: "The quality of being friendly and considerate.", direction: "across", row: 624, col: 2 },
{ word: "COMPASSION", clue: "Sympathy for others' suffering.", direction: "down", row: 621, col: 5 },
{ word: "EMPATHY", clue: "The ability to understand and share the feelings of others.", direction: "across", row: 625, col: 1 },
{ word: "CONNECTION", clue: "A relationship or bond with someone.", direction: "down", row: 622, col: 6 },
{ word: "FRIENDSHIP", clue: "A mutual affection between people.", direction: "across", row: 626, col: 2 },
{ word: "SUPPORT", clue: "To provide assistance to someone.", direction: "down", row: 623, col: 5 },
{ word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal.", direction: "across", row: 627, col: 1 },
{ word: "COLLECTIVE", clue: "A group acting as a whole.", direction: "down", row: 624, col: 6 },
{ word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes.", direction: "across", row: 628, col: 2 },
{ word: "COLLABORATION", clue: "The act of working together towards a common goal.", direction: "down", row: 625, col: 5 },
{ word: "CHANGE", clue: "The act of making something different.", direction: "across", row: 629, col: 1 },
{ word: "PROGRESS", clue: "Forward movement towards a goal.", direction: "down", row: 626, col: 6 },
{ word: "ACHIEVEMENT", clue: "The act of achieving something.", direction: "across", row: 630, col: 2 },
{ word: "SUCCESS", clue: "The accomplishment of an aim or purpose.", direction: "down", row: 627, col: 5 },
{ word: "HAPPINESS", clue: "The state of being happy.", direction: "across", row: 631, col: 1 },
{ word: "CONTENTMENT", clue: "A state of happiness and satisfaction.", direction: "down", row: 628, col: 6 },
{ word: "JOY", clue: "A feeling of great pleasure or happiness.", direction: "across", row: 632, col: 2 },
{ word: "LOVE", clue: "An intense feeling of deep affection.", direction: "down", row: 629, col: 5 },
{ word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness.", direction: "across", row: 633, col: 1 },
{ word: "GENEROSITY", clue: "The quality of being kind and giving.", direction: "down", row: 630, col: 6 },
{ word: "KINDNESS", clue: "The quality of being friendly and considerate.", direction: "across", row: 634, col: 2 },
{ word: "COMPASSION", clue: "Sympathy for others' suffering.", direction: "down", row: 631, col: 5 },
{ word: "EMPATHY", clue: "The ability to understand and share the feelings of others.", direction: "across", row: 635, col: 1 },
{ word: "CONNECTION", clue: "A relationship or bond with someone.", direction: "down", row: 632, col: 6 },
{ word: "FRIENDSHIP", clue: "A mutual affection between people.", direction: "across", row: 636, col: 2 },
{ word: "SUPPORT", clue: "To provide assistance to someone.", direction: "down", row: 633, col: 5 },
{ word: "TEAMWORK", clue: "The combined efforts of a group towards a common goal.", direction: "across", row: 637, col: 1 },
{ word: "COLLECTIVE", clue: "A group acting as a whole.", direction: "down", row: 634, col: 6 },
{ word: "NETWORKING", clue: "The act of connecting with others for professional or social purposes.", direction: "across", row: 638, col: 2 },
{ word: "COLLABORATION", clue: "The act of working together towards a common goal.", direction: "down", row: 635, col: 5 },
{ word: "CHANGE", clue: "The act of making something different.", direction: "across", row: 639, col: 1 },
{ word: "PROGRESS", clue: "Forward movement towards a goal.", direction: "down", row: 636, col: 6 },
{ word: "ACHIEVEMENT", clue: "The act of achieving something.", direction: "across", row: 640, col: 2 },
{ word: "SUCCESS", clue: "The accomplishment of an aim or purpose.", direction: "down", row: 637, col: 5 },
{ word: "HAPPINESS", clue: "The state of being happy.", direction: "across", row: 641, col: 1 },
{ word: "CONTENTMENT", clue: "A state of happiness and satisfaction.", direction: "down", row: 638, col: 6 },
{ word: "JOY", clue: "A feeling of great pleasure or happiness.", direction: "across", row: 642, col: 2 },
{ word: "LOVE", clue: "An intense feeling of deep affection.", direction: "down", row: 639, col: 5 },
{ word: "GRATITUDE", clue: "A feeling of appreciation or thankfulness.", direction: "across", row: 643, col: 1 },
{ word: "GENEROSITY", clue: "The quality of being kind and giving.", direction: "down", row: 640, col: 6 },
{ word: "KINDNESS", clue: "The quality of being friendly and considerate.", direction: "across", row: 644, col: 2 },
  { word: "KINDNESS", clue: "The quality of being friendly and considerate." },
  ]

export default function CrosswordGenerator() {
  const [puzzleCount, setPuzzleCount] = useState(1)
  const [puzzleTitle, setPuzzleTitle] = useState('Crossword Puzzle')
  const [fontSize, setFontSize] = useState(14)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [difficulty, setDifficulty] = useState('easy')
  const [puzzleWidth, setPuzzleWidth] = useState(20)
  const [puzzleHeight, setPuzzleHeight] = useState(20)
  const [puzzles, setPuzzles] = useState<Word[][]>([])
  const [selectedFileSize, setSelectedFileSize] = useState<FileSize>(fileSizes[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [customWordList, setCustomWordList] = useState<Word[]>([])
  const [newWord, setNewWord] = useState({ word: '', clue: '' })
  const [lineWidth, setLineWidth] = useState(1)
  const [showWarning, setShowWarning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [user, setUser] = useState<User | null>(null)

  // License management state
  const [licenseKey, setLicenseKey] = useState('')
  const [licenseType, setLicenseType] = useState<'one-month' | 'lifetime'>('one-month')
  const [isValidating, setIsValidating] = useState(false)
  const [license, setLicense] = useState<License | null>(null)

  const wordList = customWordList.length > 0 ? customWordList : defaultWordList

  const generatePuzzle = () => {
    const puzzle: Word[] = []
    const usedCells: { [key: string]: string } = {}
    const gridSize = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 20 : 25

    const shuffledWords = [...wordList].sort(() => Math.random() - 0.5)

    for (const word of shuffledWords) {
      const placed = placeWord(word, usedCells, gridSize)
      if (placed) {
        puzzle.push(placed)
      }

      if (puzzle.length >= 15) break // Limit the number of words per puzzle
    }

    return puzzle
  }

  const placeWord = (word: Word, usedCells: { [key: string]: string }, gridSize: number): Word | null => {
    const maxAttempts = 100
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const direction = Math.random() > 0.5 ? 'across' : 'down'
      const maxRow = direction === 'across' ? gridSize : gridSize - word.word.length
      const maxCol = direction === 'across' ? gridSize - word.word.length : gridSize
      
      const row = Math.floor(Math.random() * maxRow)
      const col = Math.floor(Math.random() * maxCol)

      if (canPlaceWord(word, row, col, direction, usedCells, gridSize)) {
        markUsedCells(word, row, col, direction, usedCells)
        return { ...word, row, col, direction }
      }
    }
    return null
  }

  const canPlaceWord = (word: Word, row: number, col: number, direction: 'across' | 'down', usedCells: { [key: string]: string }, gridSize: number): boolean => {
    let hasIntersection = false
    for (let i = 0; i < word.word.length; i++) {
      const currentRow = direction === 'across' ? row : row + i
      const currentCol = direction === 'across' ? col + i : col

      if (currentRow >= gridSize || currentCol >= gridSize) return false

      const cellKey = `${currentRow},${currentCol}`
      if (usedCells[cellKey] && usedCells[cellKey] !== word.word[i]) return false
      if (usedCells[cellKey] === word.word[i]) hasIntersection = true
    }
    return hasIntersection || word.word.length > 3
  }

  const markUsedCells = (word: Word, row: number, col: number, direction: 'across' | 'down', usedCells: { [key: string]: string }) => {
    for (let i = 0; i < word.word.length; i++) {
      const currentRow = direction === 'across' ? row : row + i
      const currentCol = direction === 'across' ? col + i : col
      usedCells[`${currentRow},${currentCol}`] = word.word[i]
    }
  }

  const generatePuzzles = async () => {
    if (!license || !license.isActive) {
      toast({
        title: "License Required",
        description: "Please activate a valid license to generate puzzles.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    const newPuzzles = []
    const batchSize = 100
    const totalBatches = Math.ceil(puzzleCount / batchSize)

    for (let batch = 0; batch < totalBatches; batch++) {
      const batchPuzzles = []
      const currentBatchSize = Math.min(batchSize, puzzleCount - batch * batchSize)

      for (let i = 0; i < currentBatchSize; i++) {
        batchPuzzles.push(generatePuzzle())
      }

      newPuzzles.push(...batchPuzzles)

      // Update progress
      const progress = Math.round(((batch + 1) * batchSize / puzzleCount) * 100)
      toast({
        title: "Generating Puzzles",
        description: `Progress: ${Math.min(progress, 100)}%`,
      })

      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    setPuzzles(newPuzzles)
    setIsGenerating(false)
    toast({
      title: "Puzzles Generated",
      description: `${puzzleCount} puzzle${puzzleCount > 1 ? 's' : ''} generated successfully.`,
    })
  }

  const drawPuzzle = (ctx: CanvasRenderingContext2D, puzzle: Word[], showSolution: boolean, puzzleNumber: number) => {
    const { width, height } = selectedFileSize
    const scaledWidth = width * RESOLUTION_SCALE
    const scaledHeight = height * RESOLUTION_SCALE
    const aspectRatio = scaledWidth / scaledHeight
    const maxGridSize = Math.min(scaledWidth, scaledHeight) * 0.8
    const cellSize = maxGridSize / Math.max(puzzleWidth, puzzleHeight)
    const gridWidth = puzzleWidth * cellSize
    const gridHeight = puzzleHeight * cellSize
    const padding = (scaledWidth - gridWidth) / 2
    const titleHeight = scaledHeight * 0.1
    const cluesHeight = scaledHeight * 0.3

    // Set canvas size
    ctx.canvas.width = scaledWidth
    ctx.canvas.height = scaledHeight

    // Clear canvas
    ctx.clearRect(0, 0, scaledWidth, scaledHeight)
    
    // Set white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, scaledWidth, scaledHeight)

    // Enable anti-aliasing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Draw title
    ctx.fillStyle = 'black'
    ctx.font = `bold ${titleHeight * 0.5}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${puzzleTitle} ${puzzleNumber}`, scaledWidth / 2, titleHeight / 2)

    // Draw grid
    ctx.strokeStyle = 'black'
    ctx.lineWidth = lineWidth * RESOLUTION_SCALE
    
    for (let i = 0; i <= puzzleWidth; i++) {
      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(padding + i * cellSize, titleHeight)
      ctx.lineTo(padding + i * cellSize, titleHeight + gridHeight)
      ctx.stroke()
    }
    
    for (let i = 0; i <= puzzleHeight; i++) {
      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(padding, titleHeight + i * cellSize)
      ctx.lineTo(padding + gridWidth, titleHeight + i * cellSize)
      ctx.stroke()
    }

    // Draw letters and numbers
    ctx.font = `bold ${cellSize * 0.7}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    puzzle.forEach((word, wordIndex) => {
      if (word.row !== undefined && word.col !== undefined && word.direction) {
        for (let i = 0; i < word.word.length; i++) {
          const row = word.direction === 'across' ? word.row : word.row + i
          const col = word.direction === 'across' ? word.col + i : word.col
          
          if (showSolution) {
            ctx.fillStyle = 'black'
            ctx.fillText(
              word.word[i],
              padding + col * cellSize + cellSize / 2,
              titleHeight + row * cellSize + cellSize / 2
            )
          }
          
          // Draw word number for first letter
          if (i === 0) {
            ctx.fillStyle = 'black'
            ctx.font = `bold ${cellSize * 0.35}px ${fontFamily}`
            ctx.fillText(
              (wordIndex + 1).toString(),
              padding + col * cellSize + cellSize * 0.2,
              titleHeight + row * cellSize + cellSize * 0.2
            )
            ctx.font = `bold ${cellSize * 0.7}px ${fontFamily}`
          }
        }
      }
    })

    // Draw clues
    ctx.textAlign = 'left'
    ctx.font = `${cluesHeight * 0.045}px ${fontFamily}`
    const cluesStartY = titleHeight + gridHeight + cluesHeight * 0.05

    ctx.fillText('Across:', padding, cluesStartY)
    ctx.fillText('Down:', padding + gridWidth / 2 + cellSize * 0.5, cluesStartY)

    let acrossY = cluesStartY + cluesHeight * 0.07
    let downY = cluesStartY + cluesHeight * 0.07

    puzzle.forEach((word, index) => {
      const clueText = `${index + 1}. ${word.clue}`
      if (word.direction === 'across') {
        ctx.fillText(clueText, padding, acrossY, gridWidth / 2 - cellSize)
        acrossY += cluesHeight * 0.05
      } else {
        ctx.fillText(clueText, padding + gridWidth / 2 + cellSize * 0.5, downY, gridWidth / 2 - cellSize)
        downY += cluesHeight * 0.05
      }
    })
  }

  const drawSolutionSeparator = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = selectedFileSize
    const scaledWidth = width * RESOLUTION_SCALE
    const scaledHeight = height * RESOLUTION_SCALE

    // Set canvas size
    ctx.canvas.width = scaledWidth
    ctx.canvas.height = scaledHeight

    // Clear canvas
    ctx.clearRect(0, 0, scaledWidth, scaledHeight)
    
    // Set white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, scaledWidth, scaledHeight)

    // Draw "SOLUTION" text
    ctx.fillStyle = 'black'
    ctx.font = `bold ${scaledHeight * 0.1}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SOLUTION', scaledWidth / 2, scaledHeight / 2)
  }

  const generatePDF = (puzzles: Word[][]) => {
    const pdf = new jsPDF({
      orientation: selectedFileSize.width > selectedFileSize.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [selectedFileSize.width, selectedFileSize.height]
    })
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Add all puzzles
    puzzles.forEach((puzzle, index) => {
      if (index > 0) pdf.addPage([selectedFileSize.width, selectedFileSize.height])
      drawPuzzle(ctx, puzzle, false, index + 1)
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, selectedFileSize.width, selectedFileSize.height)
    })

    // Add solution separator
    pdf.addPage([selectedFileSize.width, selectedFileSize.height])
    drawSolutionSeparator(ctx)
    const separatorImgData = canvas.toDataURL('image/png')
    pdf.addImage(separatorImgData, 'PNG', 0, 0, selectedFileSize.width, selectedFileSize.height)

    // Add all solutions
    puzzles.forEach((puzzle, index) => {
      pdf.addPage([selectedFileSize.width, selectedFileSize.height])
      drawPuzzle(ctx, puzzle, true, index + 1)
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, selectedFileSize.width, selectedFileSize.height)
    })

    return pdf
  }

  const generatePowerPoint = async (puzzles: Word[][]) => {
    const pptx = new pptxgen()
    pptx.defineLayout({ name: 'CUSTOM', width: selectedFileSize.width / 25.4, height: selectedFileSize.height / 25.4 })
    pptx.layout = 'CUSTOM'

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Add all puzzles
    for (let i = 0; i < puzzles.length; i++) {
      const puzzle = puzzles[i]
      const slide = pptx.addSlide()

      drawPuzzle(ctx, puzzle, false, i + 1)
      slide.addImage({ data: canvas.toDataURL(), x: 0, y: 0, w: '100%', h: '100%' })
    }

    // Add solution separator
    const separatorSlide = pptx.addSlide()
    drawSolutionSeparator(ctx)
    separatorSlide.addImage({ data: canvas.toDataURL(), x: 0, y: 0, w: '100%', h: '100%' })

    // Add all solutions
    for (let i = 0; i < puzzles.length; i++) {
      const puzzle = puzzles[i]
      const slide = pptx.addSlide()

      drawPuzzle(ctx, puzzle, true, i + 1)
      slide.addImage({ data: canvas.toDataURL(), x: 0, y: 0, w: '100%', h: '100%' })
    }

    return pptx
  }

  const downloadPuzzles = async (format: 'png' | 'pdf' | 'pptx') => {
    if (!license || !license.isActive) {
      toast({
        title: "License Required",
        description: "Please activate a valid license to download puzzles.",
        variant: "destructive",
      })
      return
    }

    if (!canvasRef.current) return
    setIsDownloading(true)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setIsDownloading(false)
      return
    }

    try {
      switch (format) {
        case 'png':
          const zip = new JSZip()
          
          // Add all puzzles
          for (let i = 0; i < puzzles.length; i++) {
            drawPuzzle(ctx, puzzles[i], false, i + 1)
            const puzzleImage = canvas.toDataURL('image/png').split(',')[1]
            zip.file(`${puzzleTitle}_${i + 1}.png`, puzzleImage, {base64: true})
          }
          
          // Add all solutions
          for (let i = 0; i < puzzles.length; i++) {
            drawPuzzle(ctx, puzzles[i], true, i + 1)
            const solutionImage = canvas.toDataURL('image/png').split(',')[1]
            zip.file(`${puzzleTitle}_${i + 1}_solution.png`, solutionImage, {base64: true})
          }
          
          // Generate and download zip file
          const content = await zip.generateAsync({type: 'blob'})
          const link = document.createElement('a')
          link.href = URL.createObjectURL(content)
          link.download = `${puzzleTitle.replace(/\s+/g, '_')}_puzzles_and_solutions.zip`
          link.click()
          break
        case 'pdf':
          const pdf = generatePDF(puzzles)
          if (!pdf) {
            throw new Error('Failed to generate PDF')
          }
          pdf.save(`${puzzleTitle.replace(/\s+/g, '_')}_puzzles_and_solutions.pdf`)
          break
        case 'pptx':
          const pptx = await generatePowerPoint(puzzles)
          await pptx.writeFile({ fileName: `${puzzleTitle.replace(/\s+/g, '_')}_puzzles_and_solutions.pptx` })
          break
      }

      toast({
        title: "Puzzles Downloaded",
        description: `${puzzles.length} puzzle${puzzles.length > 1 ? 's' : ''} and solution${puzzles.length > 1 ? 's' : ''} downloaded as ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error('Error downloading puzzles:', error)
      toast({
        title: "Download Failed",
        description: `There was an error downloading the puzzles. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const addCustomWord = () => {
    if (newWord.word && newWord.clue) {
      setCustomWordList([...customWordList, { word: newWord.word.toUpperCase(), clue: newWord.clue }])
      setNewWord({ word: '', clue: '' })
    }
  }

  const removeCustomWord = (index: number) => {
    setCustomWordList(customWordList.filter((_, i) => i !== index))
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      setUser(result.user)
      toast({
        title: "Signed in successfully",
        description: `Welcome, ${result.user.displayName}!`,
      })
    } catch (error) {
      console.error('Error signing in with Google:', error)
      toast({
        title: "Sign-in Error",
        description: "Failed to sign in with Google.",
        variant: "destructive",
      })
    }
  }

  const signOut = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setLicense(null)
      toast({
        title: "Signed out successfully",
        description: "You have been signed out.",
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const validateLicenseKey = async () => {
    setIsValidating(true)
    
    try {
      const isValid = validLicenseKeys.includes(licenseKey)
      
      if (isValid) {
        // Check if this key was previously used
        const storedLicense = localStorage.getItem(`license_${licenseKey}`)
        
        if (storedLicense) {
          const parsedLicense = JSON.parse(storedLicense)
          const expirationDate = new Date(parsedLicense.expirationDate)
          
          if (new Date() > expirationDate) {
            toast({
              title: "License Expired",
              description: "This license key has already been used and has expired.",
              variant: "destructive",
            })
            setIsValidating(false)
            return
          }
        }

        const newLicense: License = {
          key: licenseKey,
          type: licenseKey.startsWith('MONTH') ? 'one-month' : 'lifetime',
          isActive: true,
        }

        if (newLicense.type === 'one-month') {
          const expirationDate = new Date()
          expirationDate.setDate(expirationDate.getDate() + 30)
          newLicense.expirationDate = expirationDate
          
          // Store license info in localStorage
          localStorage.setItem(`license_${licenseKey}`, JSON.stringify(newLicense))
        }

        setLicense(newLicense)
        toast({
          title: "License Activated",
          description: `Your ${newLicense.type} license has been successfully activated.`,
        })
      } else {
        toast({
          title: "Invalid License Key",
          description: "Please check your license key and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('License validation error:', error)
      toast({
        title: "Validation Error",
        description: "An error occurred while validating the license.",
        variant: "destructive",
      })
    }

    setIsValidating(false)
  }

  useEffect(() => {
    if (puzzles.length > 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        drawPuzzle(ctx, puzzles[0], false, 1)
      }
    }
  }, [puzzles, fontSize, fontFamily, puzzleWidth, puzzleHeight, selectedFileSize, lineWidth, puzzleTitle])

  useEffect(() => {
    setShowWarning(puzzleCount > 100)
  }, [puzzleCount])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid gap-6">
        <div className="grid gap-4">
          <h1 className="text-2xl font-bold">Crossword Puzzle Generator</h1>
          
          {!license || !license.isActive ? (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">License Management</h2>
              
              {!user ? (
                <Button 
                  onClick={signInWithGoogle} 
                  className="w-full"
                  variant="outline"
                >
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="w-4 h-4 mr-2"
                  />
                  Sign in with Google to activate license
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={user.photoURL || undefined} 
                        alt={user.displayName || 'User'} 
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{user.displayName}</span>
                    </div>
                    <Button 
                      onClick={signOut} 
                      variant="ghost" 
                      size="sm"
                    >
                      Sign out
                    </Button>
                  </div>

                  <RadioGroup value={licenseType} onValueChange={setLicenseType as (value: string) => void} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="one-month" id="one-month" />
                      <Label htmlFor="one-month">One Month Subscription</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lifetime" id="lifetime" />
                      <Label htmlFor="lifetime">Lifetime Subscription</Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-2">
                    <Label htmlFor="license-key">Enter your license key</Label>
                    <Input
                      id="license-key"
                      type="text"
                      placeholder={licenseType === 'one-month' ? 'MONTH-XXXXX-XXXXX' : 'LIFE-XXXXX-XXXXX'}
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={validateLicenseKey} 
                    disabled={isValidating || licenseKey.length === 0} 
                    className="w-full"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Activate License
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="puzzleTitle">Puzzle Title</Label>
                <Input
                  id="puzzleTitle"
                  type="text"
                  value={puzzleTitle}
                  onChange={(e) => setPuzzleTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="puzzleCount">Number of Puzzles</Label>
                <Input
                  id="puzzleCount"
                  type="number"
                  min="1"
                  max="1000"
                  value={puzzleCount}
                  onChange={(e) => setPuzzleCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                />
                {showWarning && (
                  <Alert variant="default">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Generating a large number of puzzles may take some time and consume significant resources.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="puzzleWidth">Puzzle Width</Label>
                <Input
                  id="puzzleWidth"
                  type="number"
                  min="10"
                  max="30"
                  value={puzzleWidth}
                  onChange={(e) => setPuzzleWidth(Math.max(10, Math.min(30, parseInt(e.target.value) || 10)))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="puzzleHeight">Puzzle Height</Label>
                <Input
                  id="puzzleHeight"
                  type="number"
                  min="10"
                  max="30"
                  value={puzzleHeight}
                  onChange={(e) => setPuzzleHeight(Math.max(10, Math.min(30, parseInt(e.target.value) || 10)))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.max(12, Math.min(24, parseInt(e.target.value) || 12)))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fileSize">File Size</Label>
                <Select
                  value={selectedFileSize.name}
                  onValueChange={(value) => setSelectedFileSize(fileSizes.find(size => size.name === value) || fileSizes[0])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fileSizes.map((size) => (
                      <SelectItem key={size.name} value={size.name}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lineWidth">Grid Line Width</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="lineWidth"
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                    className="flex-grow"
                  />
                  <span className="w-12 text-right">{lineWidth.toFixed(1)}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Custom Word List</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Word"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  />
                  <Input
                    placeholder="Clue"
                    value={newWord.clue}
                    onChange={(e) => setNewWord({ ...newWord, clue: e.target.value })}
                  />
                  <Button onClick={addCustomWord}>
                    <Plus className="w-4 h-4" />
                    <span className="sr-only">Add Word</span>
                  </Button>
                </div>
                {customWordList.map((word, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{word.word}: {word.clue}</span>
                    <Button variant="ghost" onClick={() => removeCustomWord(index)}>
                      <Minus className="w-4 h-4" />
                      <span className="sr-only">Remove Word</span>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button onClick={generatePuzzles} disabled={isGenerating} className="flex items-center gap-2">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {isGenerating ? 'Generating...' : 'Generate Puzzles'}
                </Button>
                <Button onClick={() => downloadPuzzles('png')} disabled={puzzles.length === 0 || isDownloading} className="flex items-center gap-2">
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isDownloading ? 'Downloading...' : 'Download PNG (Zip)'}
                </Button>
                <Button onClick={() => downloadPuzzles('pdf')} disabled={puzzles.length === 0 || isDownloading} className="flex items-center gap-2">
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isDownloading ? 'Downloading...' : 'Download PDF'}
                </Button>
                <Button onClick={() => downloadPuzzles('pptx')} disabled={puzzles.length === 0 || isDownloading} className="flex items-center gap-2">
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isDownloading ? 'Downloading...' : 'Download PowerPoint'}
                </Button>
              </div>
            </>
          )}
        </div>

        {license && license.isActive && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div style={{ position: 'relative', width: '100%', paddingBottom: `${(selectedFileSize.height / selectedFileSize.width) * 100}%` }}>
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                aria-label="Crossword Puzzle Preview"
              />
            </div>
          </div>
        )}

        {license && license.isActive && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">License Information</h2>
            <p>Type: {license.type === 'one-month' ? 'One Month Subscription' : 'Lifetime Subscription'}</p>
            {license.type === 'one-month' && license.expirationDate && (
              <p>Expires on: {license.expirationDate.toLocaleDateString()}</p>
            )}
            <Button 
              onClick={() => setLicense(null)} 
              variant="outline"
              className="mt-4"
            >
              <Lock className="mr-2 h-4 w-4" />
              Deactivate License
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}