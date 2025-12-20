
export interface CardData {
  id: string;
  content: string;
  rotation: number;
  width: number;
  height: number;
  color: string;
  fontFamily: string;
}

// Added missing Photo interface used in PhotoCard component
export interface Photo {
  url: string;
  title: string;
  rotation: number;
  offsetY: number;
  width: number;
  height: number;
}
