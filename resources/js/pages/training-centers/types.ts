export interface StateOption {
    id: number;
    state: string;
}

export interface DistrictOption {
    id: number;
    district: string;
    state_id: number;
}

export interface TalukaOption {
    id: number;
    taluko: string;
    district_id: number;
    state_id: number;
}

export interface CityOption {
    id: number;
    city: string;
    taluka_id: number;
    district_id: number;
    state_id: number;
}

export interface TrainingCenterFormData {
    tc_id: string;
    sip_id: string;
    name: string;
    address: string;
    state_id: string | number;
    district_id: string | number;
    taluka_id: string | number;
    city_id: string | number;
    pin_code: string;
    email: string;
    mobile: string;
    website: string;
    spoc_name: string;
    spoc_mobile: string;
    authorized_person_name: string;
    authorized_mobile: string;
    password?: string;
    status: boolean;
}
