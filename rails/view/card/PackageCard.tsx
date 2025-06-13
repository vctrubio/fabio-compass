import React from 'react';
import { DrizzleData } from '@/rails/types';
import { PackageStudentType } from '../../model/PackageStudentModel';
import PackageTag from '../tag/PackageTag';

interface PackageCardProps {
  package: DrizzleData<PackageStudentType>;
  className?: string;
}

export default function PackageCard({ package: packageData, className = "" }: PackageCardProps) {
  const pkg = packageData.data;
  
  return (
    <PackageTag 
      price={pkg.price}
      duration={pkg.duration}
      capacity={pkg.capacity}
      className={className}
    />
  );
}
