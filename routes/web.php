<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\CityController;
use App\Http\Controllers\Admin\DistrictController;
use App\Http\Controllers\Admin\JobRoleController;
use App\Http\Controllers\Admin\SchemeController;
use App\Http\Controllers\Admin\SectorController;
use App\Http\Controllers\Admin\StateController;
use App\Http\Controllers\Admin\TalukaController;
use App\Http\Controllers\Admin\ProjectTypeController;
use App\Http\Controllers\Masters\DocumentMasterController;
use App\Http\Controllers\TrainingPartner\TrainingPartnerController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/storage-link', function () {
    Artisan::call('storage:link');
    return 'Storage link created!';
});

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::resource('states', StateController::class);
        Route::resource('districts', DistrictController::class);
        Route::resource('talukas', TalukaController::class);
        Route::resource('cities', CityController::class);
        Route::resource('schemes', SchemeController::class);
        Route::resource('sectors', SectorController::class);
        Route::resource('job-roles', JobRoleController::class);
        Route::post('/job-roles/{job_role}/upload-syllabus', [JobRoleController::class, 'uploadSyllabus'])->name('job-roles.upload-syllabus');
        Route::resource('project-types', ProjectTypeController::class);

        Route::prefix('masters')->name('masters.')->group(function () {
            Route::resource('document-master', DocumentMasterController::class)->parameters([
                'document-master' => 'document_master',
            ]);
        });

        Route::prefix('training-partners')->name('training-partners.')->group(function () {
            Route::get('/', [TrainingPartnerController::class, 'index'])->name('index');
            Route::get('/create', [TrainingPartnerController::class, 'create'])->name('create');
            Route::post('/basic-details', [TrainingPartnerController::class, 'storeBasicDetails'])->name('storeBasicDetails');
            Route::get('/{training_partner}/edit', [TrainingPartnerController::class, 'edit'])->name('edit');
            Route::put('/{training_partner}/basic-details', [TrainingPartnerController::class, 'updateBasicDetails'])->name('updateBasicDetails');
            
            Route::post('/{training_partner}/scheme-mapping', [TrainingPartnerController::class, 'storeSchemeMapping'])->name('storeSchemeMapping');
            Route::delete('/{training_partner}/scheme-mapping/{mapping_id}', [TrainingPartnerController::class, 'deleteSchemeMapping'])->name('deleteSchemeMapping');
            
            Route::put('/{training_partner}/bank-details', [TrainingPartnerController::class, 'updateBankDetails'])->name('updateBankDetails');
            
            Route::post('/{training_partner}/documents', [TrainingPartnerController::class, 'updateDocuments'])->name('updateDocuments');
            
            Route::delete('/{training_partner}', [TrainingPartnerController::class, 'destroy'])->name('destroy');
        });
    });

Route::middleware(['auth', 'role:training_partner'])
    ->prefix('tp')
    ->name('tp.')
    ->group(function () {
        Route::resource('training-centers', \App\Http\Controllers\TrainingPartner\TrainingCenterController::class)->parameters([
            'training-centers' => 'training_center',
        ]);

        Route::prefix('target-allocations')->name('target-allocations.')->group(function () {
            Route::get('/', [\App\Http\Controllers\TrainingPartner\TargetAllocationController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\TrainingPartner\TargetAllocationController::class, 'create'])->name('create');
            Route::post('/project-details', [\App\Http\Controllers\TrainingPartner\TargetAllocationController::class, 'storeProjectDetails'])->name('storeProjectDetails');
            Route::get('/{target_allocation}/edit', [\App\Http\Controllers\TrainingPartner\TargetAllocationController::class, 'edit'])->name('edit');
            Route::put('/{target_allocation}', [\App\Http\Controllers\TrainingPartner\TargetAllocationController::class, 'update'])->name('update');
            Route::post('/{target_allocation}/add-center', [\App\Http\Controllers\TrainingPartner\TargetAllocationController::class, 'addCenter'])->name('addCenter');
            Route::delete('/{target_allocation}/remove-center/{center_id}', [\App\Http\Controllers\TrainingPartner\TargetAllocationController::class, 'removeCenter'])->name('removeCenter');
            Route::post('/{target_allocation}/add-job-role', [\App\Http\Controllers\TrainingPartner\TargetAllocationController::class, 'addJobRoleTarget'])->name('addJobRoleTarget');
            Route::delete('/{target_allocation}/remove-job-role/{job_role_target_id}', [\App\Http\Controllers\TrainingPartner\TargetAllocationController::class, 'removeJobRoleTarget'])->name('removeJobRoleTarget');
        });

        Route::resource('trainers', \App\Http\Controllers\TrainingPartner\TrainerController::class);
        Route::put('trainers/{trainer}/qualifications', [\App\Http\Controllers\TrainingPartner\TrainerController::class, 'update'])->name('trainers.qualifications.update');
        
        // TP Batch Management
        Route::prefix('batches')->name('batches.')->group(function () {
            Route::get('/', [\App\Http\Controllers\TrainingPartner\BatchController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\TrainingPartner\BatchController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\TrainingPartner\BatchController::class, 'store'])->name('store');
            Route::get('/{batch}/edit', [\App\Http\Controllers\TrainingPartner\BatchController::class, 'edit'])->name('edit');
            Route::put('/{batch}', [\App\Http\Controllers\TrainingPartner\BatchController::class, 'update'])->name('update');
            Route::delete('/{batch}', [\App\Http\Controllers\TrainingPartner\BatchController::class, 'destroy'])->name('destroy');
            Route::post('/{batch}/approve', [\App\Http\Controllers\TrainingPartner\BatchController::class, 'approve'])->name('approve');
            Route::post('/{batch}/reject', [\App\Http\Controllers\TrainingPartner\BatchController::class, 'reject'])->name('reject');
            Route::post('/{batch}/modify', [\App\Http\Controllers\TrainingPartner\BatchController::class, 'modify'])->name('modify');
        });
    });

Route::middleware(['auth', 'role:training_center'])
    ->prefix('tc')
    ->name('tc.')
    ->group(function () {
        // TC Batch Management
        Route::resource('batches', \App\Http\Controllers\TrainingCenter\BatchController::class);
        Route::post('batches/{batch}/submit', [\App\Http\Controllers\TrainingCenter\BatchController::class, 'submit'])->name('batches.submit');
    });


    Route::middleware(['auth'])->prefix('locations')->name('locations.')->group(function () {
        Route::get('/states', [\App\Http\Controllers\Api\LocationController::class, 'getStates'])->name('states');
        Route::get('/districts', [\App\Http\Controllers\Api\LocationController::class, 'getDistricts'])->name('districts');
        Route::get('/talukas', [\App\Http\Controllers\Api\LocationController::class, 'getTalukas'])->name('talukas');
        Route::get('/cities', [\App\Http\Controllers\Api\LocationController::class, 'getCities'])->name('cities');
    });


    // Master Data routes for dependent dropdowns
    Route::middleware(['auth'])->prefix('master-data')->name('master-data.')->group(function () {
        Route::get('/sectors', [\App\Http\Controllers\Api\MasterDataController::class, 'getSectors'])->name('sectors');
        Route::get('/job-roles', [\App\Http\Controllers\Api\MasterDataController::class, 'getJobRoles'])->name('job-roles');
    });

require __DIR__.'/settings.php';
